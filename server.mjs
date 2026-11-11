import {createServer} from 'node:http';
import {randomBytes, randomInt} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {networkInterfaces} from 'node:os';
import questions from './questions.mjs';

const page = await readFile(new URL('./index.html', import.meta.url));
const rooms = new Map();
const WIDTH = 24, HEIGHT = 15, TICK = 150;
const directions = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const same = (a,b) => a && b && a.x===b.x && a.y===b.y;
const fail = message => { throw new Error(message); };

function spawn(room, player) {
  const facing = player.index===0?1:-1;
  const rows = player.index===0 ? [4,3,5,2,6,1,7,0,8,9,10,11,12,13,14]
    : [10,11,9,12,8,13,7,14,6,5,4,3,2,1,0];
  const occupied = room.players.filter(other=>other!==player).flatMap(other=>other.snake);
  for(const y of rows){
    for(let offset=0;offset<WIDTH-4;offset++){
      const x = facing===1?3+offset:WIDTH-4-offset;
      const cells = [1,0,-1,-2,-3].map(distance=>({x:x+facing*distance,y}));
      if(cells.some(cell=>occupied.some(other=>same(cell,other)))) continue;
      player.snake=cells.slice(1);
      player.direction=[facing,0];
      player.next=null;
      return;
    }
  }
  // Leave a crowded board playable if a long opponent blocks every spawn lane.
  room.players.filter(other=>other!==player).forEach(other=>other.snake=other.snake.slice(0,4));
  spawn(room,player);
}

function apple(room) {
  const cells=[];
  for(let y=0;y<HEIGHT;y++) for(let x=0;x<WIDTH;x++){
    const cell={x,y};
    if(!room.players.some(player=>player.snake.some(segment=>same(cell,segment)))) cells.push(cell);
  }
  return cells.length ? cells[randomInt(cells.length)] : null;
}

function addPlayer(room,name){
  const player={index:room.players.length,name,token:randomBytes(24).toString('hex'),
    snake:[],score:0,lives:5,ready:false,lastSeen:Date.now()};
  room.players.push(player);
  spawn(room,player);
  return player;
}

function points(player, amount){
  const before=Math.floor(player.score/250);
  player.score+=amount;
  if(Math.floor(player.score/250)>before) player.lives=Math.min(5,player.lives+1);
}

function question(room) {
  if(!room.deck.length){
    room.deck=questions.map((_,index)=>index);
    for(let index=room.deck.length-1;index>0;index--){
      const other=randomInt(index+1);
      [room.deck[index],room.deck[other]]=[room.deck[other],room.deck[index]];
    }
    if(room.deck.at(-1)===room.previous) room.deck.unshift(room.deck.pop());
  }
  room.previous=room.deck.pop();
  const [prompt,...options]=questions[room.previous];
  const correct=options[0];
  for(let index=options.length-1;index>0;index--){
    const other=randomInt(index+1);
    [options[index],options[other]]=[options[other],options[index]];
  }
  return {id:++room.questionId,prompt,options,correct:options.indexOf(correct)};
}

function ask(room, kind, indexes) {
  const shared=kind==='collision'?null:question(room);
  room.quiz={kind,entries:indexes.map(index=>({index,question:shared||question(room),answer:null,feedback:''}))};
  room.phase='quiz';
}

function end(room, winner, reason){
  room.winner=winner;
  room.reason=reason;
  room.phase='done';
  room.quiz=null;
}

function decide(room){
  const [a,b]=room.players;
  if(a.score===b.score) ask(room,'tie',[0,1]);
  else end(room,a.score>b.score?0:1,'Hoogste score na drie minuten.');
}

function respond(room, player, choice, id){
  const quiz=room.quiz;
  const entry=quiz?.entries.find(item=>item.index===player.index);
  if(room.phase!=='quiz'||!entry||entry.answer!==null||id!==entry.question.id) return;
  if(!Number.isInteger(choice)||choice<0||choice>=entry.question.options.length) return;
  entry.answer=choice===entry.question.correct;
  if(quiz.kind==='collision'&&!entry.answer){
    player.lives--;
    if(player.lives){
      entry.question=question(room);
      entry.answer=null;
      entry.feedback='Onjuist. Je verliest één leven en krijgt een nieuwe vraag.';
    } else if(quiz.entries.length===1){
      end(room,1-player.index,'De andere speler heeft geen levens meer.');
    }
  }
  if(room.phase!=='quiz'||quiz.entries.some(item=>item.answer===null)) return;
  if(quiz.kind==='collision'){
    const alive=room.players.filter(item=>item.lives>0);
    if(!alive.length){ decide(room); return; }
    if(alive.length===1){ end(room,alive[0].index,'De andere speler heeft geen levens meer.'); return; }
    quiz.entries.forEach(item=>spawn(room,room.players[item.index]));
    if(!room.apple||room.players.some(item=>item.snake.some(cell=>same(cell,room.apple)))) room.apple=apple(room);
    room.quiz=null;
    room.phase='play';
    return;
  }
  if(quiz.kind==='tie'){
    const correct=quiz.entries.filter(item=>item.answer);
    if(correct.length===1) end(room,correct[0].index,'Gewonnen met de beslissende biologievraag.');
    else ask(room,'tie',[0,1]);
    return;
  }
  quiz.entries.filter(item=>item.answer).forEach(item=>points(room.players[item.index],25));
  room.phase='review';
  room.resumeAt=Date.now()+3500;
}

function step(room){
  if(room.phase==='review'&&Date.now()>=room.resumeAt){
    room.quiz=null;
    room.phase='play';
    return;
  }
  if(room.phase!=='play') return;
  if(room.players.some(player=>Date.now()-player.lastSeen>5000)) return;
  room.elapsed+=TICK;
  if(room.elapsed>=180000){ decide(room); return; }
  if(room.elapsed%45000===0){ ask(room,'checkpoint',[0,1]); return; }
  const moves=room.players.map(player=>{
    if(player.next) player.direction=player.next;
    player.next=null;
    const [dx,dy]=player.direction;
    const head={x:player.snake[0].x+dx,y:player.snake[0].y+dy};
    const eats=same(head,room.apple);
    return {head,eats,body:eats?player.snake:player.snake.slice(0,-1)};
  });
  const hit=moves.flatMap(({head},index)=>{
    const other=1-index;
    const outside=head.x<0||head.x>=WIDTH||head.y<0||head.y>=HEIGHT;
    return outside||same(head,moves[other].head)||same(head,room.players[other].snake[0])
      ||moves.some(move=>move.body.some(cell=>same(cell,head)))?[index]:[];
  });
  if(hit.length){ ask(room,'collision',hit); return; }
  moves.forEach((move,index)=>{
    const player=room.players[index];
    player.snake=[move.head,...move.body];
    if(move.eats) points(player,10);
  });
  if(moves.some(move=>move.eats)) room.apple=apple(room);
  if(!room.apple) decide(room);
}

function view(room, player){
  const quiz=room.quiz;
  const mine=quiz?.entries.find(entry=>entry.index===player.index);
  return {code:room.code,you:player.index,phase:room.phase,elapsed:room.elapsed,apple:room.apple,
    winner:room.winner,reason:room.reason,
    players:room.players.map(({name,score,lives,snake,ready,lastSeen})=>({name,score,lives,snake,ready,connected:Date.now()-lastSeen<=5000})),
    quiz:quiz?{kind:quiz.kind,waiting:!mine||mine.answer!==null,
      feedback:mine?.feedback,
      question:mine?{id:mine.question.id,prompt:mine.question.prompt,options:mine.question.options}:null,
      review:room.phase==='review'?{correct:mine.question.options[mine.question.correct],results:quiz.entries.map(entry=>entry.answer)}:null}:null};
}

async function body(request){
  let raw='';
  for await(const chunk of request){
    raw+=chunk;
    if(raw.length>4096) fail('Verzoek te groot.');
  }
  return JSON.parse(raw||'{}');
}

const server=createServer(async (request,response)=>{
  response.setHeader('Cache-Control','no-store');
  response.setHeader('X-Content-Type-Options','nosniff');
  const path=new URL(request.url,'http://localhost').pathname;
  if(request.method==='GET'&&path==='/'){
    response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    response.end(page);
    return;
  }
  response.setHeader('Content-Type','application/json; charset=utf-8');
  try{
    if(request.method!=='POST'||path!=='/api') fail('Pagina niet gevonden.');
    const data=await body(request);
    const code=String(data.code??'').trim().toUpperCase();
    let room=rooms.get(code);
    let player;
    if(data.action==='create'||data.action==='join'){
      const name=String(data.name??'').trim().slice(0,24);
      if(!name) fail('Vul je naam in.');
      if(data.action==='create'){
        if(rooms.size>=200) fail('De server heeft te veel kamers. Probeer het later opnieuw.');
        let generated;
        do { generated=randomBytes(3).toString('hex').toUpperCase(); } while(rooms.has(generated));
        room={code:generated,players:[],phase:'lobby',elapsed:0,deck:[],questionId:0,touched:Date.now()};
        rooms.set(generated,room);
      } else if(!room||room.phase!=='lobby'||room.players.length>=2) fail('Deze kamer is vol of bestaat niet.');
      player=addPlayer(room,name);
    } else {
      player=room?.players.find(item=>item.token===data.token);
      if(!player) fail('Je sessie is verlopen. Maak een nieuwe kamer aan.');
      player.lastSeen=Date.now();
      if(data.action==='ready'&&room.phase==='lobby'){
        player.ready=true;
        if(room.players.length===2&&room.players.every(item=>item.ready)){
          room.apple=apple(room);
          room.phase='play';
        }
      }
      if(data.action==='turn'&&room.phase==='play'&&Object.hasOwn(directions,data.direction)){
        const vector=directions[data.direction];
        if(!player.next&&vector[0]*player.direction[0]+vector[1]*player.direction[1]===0) player.next=vector;
      }
      if(data.action==='answer') respond(room,player,data.choice,data.id);
    }
    room.touched=Date.now();
    response.end(JSON.stringify({token:player.token,state:view(room,player)}));
  } catch(error){
    response.statusCode=400;
    response.end(JSON.stringify({error:error instanceof SyntaxError?'Ongeldig verzoek.':error.message}));
  }
});
setInterval(()=>{
  for(const [code,room] of rooms){
    if(Date.now()-room.touched>30*60*1000) rooms.delete(code);
    else step(room);
  }
},TICK).unref();
const port=Number(process.env.PORT||8080);
server.listen(port,'0.0.0.0',()=>{
  for(const addresses of Object.values(networkInterfaces())){
    for(const address of addresses) if(address.family==='IPv4') console.log('http://'+address.address+':'+server.address().port);
  }
});
