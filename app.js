(() => {
'use strict';
const COURSES={N5:window.STUDY_DATA_N5,N4:window.STUDY_DATA_N4};
const app=document.getElementById('app');
if(!COURSES.N5||!COURSES.N4||!app){document.body.textContent='Thiếu data-n5.js hoặc data-n4.js. Hãy giải nén đầy đủ ZIP rồi mở index.html.';return;}
const LEVEL_PREF_KEY='nihongo_study_selected_level_v5';
let level='N5';
try{const pref=localStorage.getItem(LEVEL_PREF_KEY);if(COURSES[pref])level=pref;}catch(e){}
let DATA=COURSES[level];
let KEY=`nihongo_study_progress_${level.toLowerCase()}_${level==='N4'?'v6':'v5'}`;
const state={view:'dashboard',lessonId:DATA.lessons[0].id,lessonTab:'learn',cardIndex:0,cardFlipped:false,practiceIndex:0,answers:{},checked:{},orderChoices:[],libraryMode:'vocab',groupId:DATA.vocabGroups[0].id,chapterFilter:0,search:'',reviewQueue:[],reviewIdx:0,reviewFlip:false,hintsOpen:{}};
const freshProgress=()=>({scores:{},cards:{},visited:[DATA.lessons[0].id],activity:{},lastLesson:DATA.lessons[0].id});
let progress=freshProgress();
function newGameState(){return {autoNext:true,mode:'quiz',scope:'lesson',lessonId:state.lessonId,started:false,questions:[],index:0,selected:null,input:'',checked:false,usedHint:false,hintOpen:false,points:0,streak:0,bestStreak:0,results:[],finished:false,freeInput:'',freeWord:'',freeResult:''};}
state.game=newGameState();
let persistence=true;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object')progress={...progress,...saved};}catch(e){persistence=false;}
progress.games ||= {};
progress.wordPractice ||= {};
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// V8: illustrated images curated for specific words only, with graceful emoji fallback.
// To add a new picture, extend IMAGE_WORDS and copy one WebP to assets/vocab/.
const IMAGE_WORDS={
 'りんご':'apple','猫':'cat','犬':'dog','水':'water','電車':'train',
 'バナナ':'banana','みかん':'orange','ぶどう':'grapes','果物':'fruit',
 '学生':'student','留学生':'student','家':'house',
 '嬉しい':'happy','うれしい':'happy','食べます':'eating',
 '食べる':'eating',
 'ベトナム':'flag-vietnam','日本':'flag-japan','中国':'flag-china','韓国':'flag-korea','タイ':'flag-thailand',
 'ベトナム人':'flag-vietnam','日本人':'flag-japan','中国人':'flag-china','韓国人':'flag-korea','タイ人':'flag-thailand'
};
const VISUAL_EMOJI=[[/日本|ベトナム|中国|韓国|タイ|アメリカ/,'🌏'],[/先生|教師|学生|学校|勉強/,'🎓'],[/飲|水|ジュース|コーヒー|お茶/,'🥤'],[/電車|駅|バス|車|自転車/,'🚃'],[/食|料理|魚|肉|ご飯|くだもの|果物/,'🍱'],[/猫|犬|鳥|動物/,'🐾'],[/家|部屋|庭|ホテル|旅館/,'🏡'],[/本|辞書|読む|ノート/,'📚'],[/朝|昼|夜|今日|明日|昨日|時|曜日/,'⏰'],[/台風|雨|雷|雪|天気/,'🌦️'],[/病院|医者|風邪|薬/,'🩺']];
function visualKey(word){
 const key=String(word?.jp??word??'').split('（')[0].replace(/^（[^）]*）/,'').trim();
 return IMAGE_WORDS[key]||null;
}
function fallbackEmoji(word){const key=String(word?.jp??word??'');return VISUAL_EMOJI.find(([rx])=>rx.test(key))?.[1]||'🌸';}
function visualCard(word,klass='vocab-photo'){
 const key=visualKey(word);
 const url=key?(window.STUDY_IMAGE_DATA?.[key]||`assets/vocab/${key}.${key.startsWith("flag-")?"svg":"webp"}`):null;
 return key?`<img class="${klass}" loading="lazy" decoding="async" src="${url}" alt="Minh họa ${escapeHTML(word.meaning||word.jp)}">`:`<div class="${klass} visual-placeholder" role="img" aria-label="Biểu tượng minh họa">${fallbackEmoji(word)}</div>`;
}
let gameAdvanceTimer=null;
function cancelGameAdvance(){if(gameAdvanceTimer!==null){clearTimeout(gameAdvanceTimer);gameAdvanceTimer=null;}}
function afterGameRender(){requestAnimationFrame(()=>{
 const area=document.getElementById('game-play-top');if(area)area.scrollIntoView({block:'start',behavior:'instant'});
 if(state.game.started&&!state.game.checked&&state.game.questions[state.game.index]?.kind!=='quiz'){
  document.getElementById('game-input')?.focus({preventScroll:true});
 }
});}
function scheduleGameAdvance(){
 cancelGameAdvance();const g=state.game;if(!g.autoNext||!g.started||!g.checked||g.finished)return;
 const idx=g.index,lv=level;
 gameAdvanceTimer=setTimeout(()=>{
  gameAdvanceTimer=null;
  if(level!==lv||state.view!=='games'&&!(state.view==='lesson'&&state.lessonTab==='games')||!state.game.checked||state.game.index!==idx)return;
  nextGameQuestion();render();afterGameRender();
 },1700);
}

const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const dateAdd=(days)=>{const d=new Date();d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const score=l=>progress.scores[l.id]?.best||0;
const lastScore=l=>progress.scores[l.id]?.last||0;
const lesson=()=>DATA.lessons.find(l=>l.id===state.lessonId)||DATA.lessons[0];
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(e){persistence=false;}}
function selectLevel(next){
  cancelGameAdvance();
  if(!COURSES[next]||next===level)return;
  level=next;DATA=COURSES[level];KEY=`nihongo_study_progress_${level.toLowerCase()}_${level==='N4'?'v6':'v5'}`;
  state.view='dashboard';state.lessonId=DATA.lessons[0].id;state.lessonTab='learn';state.libraryMode='vocab';
  state.cardIndex=0;state.cardFlipped=false;state.practiceIndex=0;state.answers={};state.checked={};
  state.orderChoices=[];state.search='';state.chapterFilter=0;state.groupId=DATA.vocabGroups[0].id;
  state.reviewQueue=[];state.reviewIdx=0;state.reviewFlip=false;state.hintsOpen={};state.game=newGameState();
  progress=freshProgress();
  try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&typeof stored==='object')progress={...progress,...stored};localStorage.setItem(LEVEL_PREF_KEY,level);}catch(e){persistence=false;}
  progress.games ||= {}; progress.wordPractice ||= {};
  render();window.scrollTo(0,0);
}
function activity(){const d=today();progress.activity[d]=(progress.activity[d]||0)+1;save();}
function progressStats(){const passed=DATA.lessons.filter(l=>score(l)>=80).length;return {passed,known:Object.values(progress.cards).filter(c=>c.ok>0).length,reviewed:Object.keys(progress.cards).length,percent:Math.round(passed/DATA.lessons.length*100)};}
function cardList(l){return [
 ...l.vocab.map(x=>({id:x.id,type:'TỪ VỰNG',front:x.jp,back:x.meaning,detail:`Từ vựng trong bộ Dung Mori ${level}`,speak:reading(x.jp)})),
 ...l.kanji.map(x=>({id:x.id,type:'KANJI',front:x.ch,back:`${x.hv} · On: ${x.on}`,detail:`Kun: ${x.kun}`,speak:reading(x.kun.replace(/[・,、].*$/,''))})),
 ...l.grammarDetails.map(x=>({id:`${l.id}_g${x.id}`,type:'NGỮ PHÁP',front:x.pattern,back:x.meaning,detail:x.example,speak:x.example}))
];}
const reading=(jp)=>{const m=String(jp).match(/（([^）]+)）/);return m?m[1]:String(jp).replace(/～/g,'');};
function kanjiDisplay(jp){return escapeHTML(String(jp??'')).replace(/([^（\n<>{}]{1,40})（([^）]{1,40})）/g,(m,base,reading)=> base.includes('～')?escapeHTML(m):`<ruby>${escapeHTML(base)}<rt>${escapeHTML(reading)}</rt></ruby>`);}
function pct(n,max){return Math.min(100,Math.round((n/max)*100));}
function activeNav(n){return state.view===n?'active':'';}
function pageShell(body){const p=progressStats();app.innerHTML=`<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">${level}</div><div><strong>Japanese Study Lab</strong><small>日本語 · MỖI NGÀY</small></div></div><nav class="sidenav" aria-label="Điều hướng chính">
${[['dashboard','⌂','Hành trình'],['lesson','◫','Bài học'],['review','◈','Ôn flashcard'],['games','🎮','Trò chơi'],['library','▤','Thư viện'],['stats','◴','Tiến độ']].map(([id,ico,text])=>`<button type="button" data-action="nav" data-view="${id}" class="nav-button ${activeNav(id)}"><span aria-hidden="true" class="icon">${ico}</span>${text}</button>`).join('')}</nav><div class="sidebar-footer"><span class="stamp">V8 · HỌC BẰNG HÌNH</span><strong>${p.passed}/${DATA.lessons.length} buổi đã đạt</strong><div style="margin:10px 0"><div class="progress"><div style="width:${p.percent}%"></div></div></div>Tiến độ N5 và N4 lưu riêng trên trình duyệt này. N3/N2/N1 sẽ bổ sung sau.</div></aside><main class="main-content"><header class="topbar"><div class="eyebrow">JAPANESE STUDY LAB · TỪ VỰNG × KANJI × NGỮ PHÁP</div><div class="topbar-actions"><span class="pill">● Chạy offline</span><span class="pill">${level} · ${DATA.lessons.length} buổi</span><button class="round-btn" data-action="help" aria-label="Trợ giúp" title="Trợ giúp">?</button></div></header><div class="level-bar"><div class="level-tabs" aria-label="Chọn trình độ"><button class="level-choice ${level==='N5'?'selected':''}" data-action="select-level" data-level="N5">🌸 N5 <small>${COURSES.N5.lessons.length} buổi</small></button><button class="level-choice ${level==='N4'?'selected':''}" data-action="select-level" data-level="N4">🌿 N4 <small>${COURSES.N4.lessons.length} buổi</small></button></div><span class="future-levels">N3 · N2 · N1 sẽ thêm sau</span></div>${!persistence?`<div class="callout">⚠ Trình duyệt đang chặn lưu trữ; tiến độ có thể mất sau khi đóng trang.</div>`:''}${body}</main></div>`;}
function dashboard(){const p=progressStats();const next=DATA.lessons.find(l=>score(l)<80)||DATA.lessons[0];pageShell(`
<div class="section-head"><div><div class="eyebrow">CHÀO MỪNG TRỞ LẠI</div><h1>${level} · Học vừa sức mỗi ngày</h1><p>Mỗi buổi tối đa 12 từ, kết hợp Kanji và ngữ pháp. N4 có đủ các buổi đã số hóa từ bài 15–33; N5 được giữ riêng.</p></div></div>
<section class="hero"><div><div class="eyebrow">BUỔI HỌC ĐỀ XUẤT</div><h2>${escapeHTML(next.title)}</h2><p>${escapeHTML(next.subtitle)} · ${next.vocab.length} từ · ${next.kanji.length} Kanji · ${next.grammar.length} mẫu ngữ pháp.</p><button class="button light" data-action="open-lesson" data-id="${next.id}">Bắt đầu buổi ${next.id.slice(1)} <span>→</span></button></div><div class="hero-jp" aria-hidden="true">${escapeHTML(next.lessonEmoji||"日本語")}</div></section>
<div class="game-spotlight"><div><div class="eyebrow">HỌC MÀ CHƠI · ${level}</div><h3>🎮 Thử thách từ vựng hôm nay</h3><p>Trắc nghiệm nhanh, gõ chữ Nhật và đặt câu từ những buổi đã học.</p></div><button class="button primary" data-action="open-game" data-id="${next.id}">Chơi ngay →</button></div>
<div class="stat-grid"><div class="stat-card"><span class="mini-icon">◈</span><span class="number">${p.passed}/${DATA.lessons.length}</span><span class="label">Buổi hoàn thành (≥80%)</span></div><div class="stat-card"><span class="mini-icon">◉</span><span class="number">${p.known}</span><span class="label">Thẻ đã đánh dấu nhớ</span></div><div class="stat-card"><span class="mini-icon">▤</span><span class="number">${DATA.counts.vocab.toLocaleString('vi-VN')}</span><span class="label">Mục từ trong thư viện</span></div><div class="stat-card"><span class="mini-icon">文</span><span class="number">${DATA.counts.kanji}</span><span class="label">Kanji tra cứu</span></div></div>
<div class="subheading"><h2>Hành trình học tích hợp</h2><span>${DATA.lessons.length} buổi ${level} · Mỗi buổi khoảng 30 phút</span></div>
<div class="lesson-grid">${DATA.lessons.map((l,i)=>`<article class="lesson-tile"><div class="lesson-top"><span class="lesson-num">BUỔI ${String(i+1).padStart(2,'0')} · ${escapeHTML(l.chapter)}</span><span class="tag ${score(l)>=80?'green':'warm'}">${score(l)>=80?'✓ Đã đạt':score(l)>0?score(l)+'% cao nhất':'Chưa học'}</span></div><h3>${escapeHTML(l.title)}</h3><p>${escapeHTML(l.subtitle)}</p><div class="progress-line"><div class="progress"><div style="width:${score(l)}%"></div></div><small>${score(l)}%</small></div><div class="lesson-meta"><span class="tag">${l.vocab.length} từ</span><span class="tag">${l.kanji.length} Kanji</span><span class="tag">${l.grammar.length} mẫu</span></div><button class="button ghost small" data-action="open-lesson" data-id="${l.id}">Học buổi này →</button></article>`).join('')}</div>
<div class="callout"><div style="font-size:24px">✦</div><div><strong>Học theo nguồn, luyện theo tình huống.</strong> ${level==='N5'?'N5 có 86 buổi với 1.024 mục từ. Mỗi buổi tối đa 12 từ.':'N4 đã được mở rộng thành 51 buổi, dùng hết 611 mục từ số hóa và các Kanji/ngữ pháp được trích từ tài liệu N4.'} Điểm và flashcard của mỗi cấp lưu độc lập.</div></div>`);}
function lessonScreen(){const l=lesson();const s=score(l);const tabs=[['learn','Tìm hiểu'],['cards','Flashcard'],['practice','Luyện tập & ghép câu'],['games','🎮 Trò chơi']];let inner='';if(state.lessonTab==='learn')inner=learnPanel(l);else if(state.lessonTab==='cards')inner=cardPanel(l);else if(state.lessonTab==='games')inner=gameContent();else inner=exercisePanel(l);
pageShell(`<div class="backline"><button data-action="nav" data-view="dashboard">← Hành trình</button> / Buổi ${escapeHTML(l.id.slice(1))}</div><section class="lesson-banner"><div><div class="eyebrow">${escapeHTML(l.chapter)} · ${l.mins} PHÚT</div><h1>${escapeHTML(l.title)}</h1><p>${escapeHTML(l.subtitle)} · ${l.vocab.length} từ + ${l.kanji.length} Kanji + ${l.grammar.length} mẫu câu</p><div class="mini-pair"><span class="tag green">Tiến độ cao nhất ${s}%</span><span class="tag">Không Romaji</span><span class="tag">Tối đa 12 từ</span><span class="tag">GitHub Pages OK</span></div></div><div class="circle-kanji" aria-hidden="true">${escapeHTML(l.lessonEmoji||l.kanji[0].ch)}</div></section><nav class="tabs" aria-label="Các phần của buổi học">${tabs.map(([t,n])=>`<button class="tab ${state.lessonTab===t?'active':''}" data-action="lesson-tab" data-tab="${t}">${n}</button>`).join('')}</nav>${inner}`);}
function learnPanel(l){return `<section class="panel lesson-visual"><h3>00 · Minh họa nhanh để vào bài</h3><div class="illustration-strip">${(l.illustrations||[]).map(it=>`<div class="illustration-card"><div class="emoji">${visualCard({jp:it.jp,meaning:it.meaning},"illustration-picture")}</div><div class="jp">${kanjiDisplay(it.jp)}</div><small>${escapeHTML(it.meaning)}</small></div>`).join('')}</div></section>
<section class="panel"><h3>01 · Từ vựng trọng tâm</h3><p class="panel-desc">Hôm nay chỉ học ${l.vocab.length} từ mới (tối đa 12). Chữ Nhật được làm to để dễ đọc.</p><div class="vocab-grid">${l.vocab.map(w=>`<div class="vocab-item visual-vocab-item">${visualCard(w)}<div class="jp">${kanjiDisplay(w.jp)}</div><div class="meaning">${escapeHTML(w.meaning)}</div><button class="speak-inline" data-action="speak" data-text="${escapeHTML(reading(w.jp))}" title="Nghe tiếng Nhật" aria-label="Nghe ${escapeHTML(w.jp)}">♫</button></div>`).join('')}</div></section>
<section class="panel"><h3>02 · Kanji của buổi này</h3><div class="kanji-grid">${l.kanji.map(k=>`<div class="kanji-mini"><div class="kanji-glyph jp">${escapeHTML(k.ch)}</div><div><div class="hv">${escapeHTML(k.hv)}</div><small>On: ${escapeHTML(k.on||"—")}</small><small>Kun: ${escapeHTML(k.kun||"—")}</small></div></div>`).join('')}</div><p class="panel-desc" style="margin-top:14px">Mới học hãy ưu tiên nhận diện chữ trong từ, chưa cần thuộc toàn bộ âm On/Kun.</p></section>
<section class="panel"><h3>03 · Ngữ pháp (mẫu mới và ôn tập)</h3><div class="grammar-grid">${l.grammarDetails.map(g=>`<div class="grammar-item"><div class="eyebrow">MẪU ${escapeHTML(g.id)} ${g.needsReview?"· CẦN ĐỐI CHIẾU PDF":""}</div><div class="formula jp">${kanjiDisplay(g.pattern)}</div><strong>${escapeHTML(g.meaning)}</strong><p>${escapeHTML(g.note)}</p>${g.example?`<div class="ex"><div class="jp">${kanjiDisplay(g.example)}</div><small>${escapeHTML(g.translation)}</small></div>`:`<div class="source-note">${escapeHTML(g.source||l.source)} · Đối chiếu ví dụ và lưu ý trong PDF gốc.</div>`}</div>`).join('')}</div><div class="source-note">Nguồn: ${escapeHTML(l.source)}. Một số câu luyện được biên soạn riêng để củng cố kiến thức.</div></section>
<section class="panel"><h3>04 · Luyện viết câu — được chấm trong phần Bài tập</h3><p class="panel-desc">Xem câu mẫu ở đây để làm quen. Sau đó sang Bài tập để gõ câu và được chấm điểm, kể cả khi bạn viết bằng Hiragana thay cho Kanji.</p><div class="freewrite-grid">${(l.freeWrite||[]).map(item=>`<div class="simple-card"><strong>${escapeHTML(item.prompt)}</strong><div class="freewrite-sample"><span>Câu mẫu để luyện trước khi kiểm tra:</span><div class="jp">${kanjiDisplay(item.sample)}</div></div></div>`).join('')}</div></section>
<div class="button-row"><button class="button primary" data-action="lesson-tab" data-tab="cards">Ôn bằng flashcard →</button><button class="button outline" data-action="lesson-tab" data-tab="practice">Làm bài luyện tập</button><button class="button outline" data-action="print">In phiếu này</button></div>`;}
function cardPanel(l){const c=cardList(l);return `<div class="section-head"><div><h2>Thẻ ôn tập của buổi này</h2><p>Chạm lật thẻ, tự đánh giá “chưa nhớ” hoặc “đã nhớ”.</p></div><button class="button outline small" data-action="export-quizlet">⇩ Tải TXT Quizlet</button></div>${flashUI(c,false)}`;}
function flashUI(cards,reviewMode){if(!cards.length)return `<div class="panel review-empty"><h2>Đã ôn xong thẻ hôm nay ✨</h2><p>Quay lại ngày mai để ôn cách quãng.</p><button class="button outline" data-action="nav" data-view="dashboard">Về hành trình</button></div>`;const idx=reviewMode?state.reviewIdx:state.cardIndex;const i=Math.min(idx,cards.length-1);const item=cards[i];const flipped=reviewMode?state.reviewFlip:state.cardFlipped;const learned=progress.cards[item.id];return `<div class="flash-layout"><div><button class="flash-card" data-action="flip-card" aria-label="Lật thẻ"><div class="card-type">${escapeHTML(item.type)} · ${flipped?'MẶT SAU':'MẶT TRƯỚC'}</div><div class="card-main ${flipped?'back':'jp'}">${!flipped&&item.type==='TỪ VỰNG'?visualCard({jp:item.front,meaning:item.back},"flash-vocab-img"):""}${flipped?escapeHTML(item.back):kanjiDisplay(item.front)}</div>${flipped?`<div class="card-extra">${escapeHTML(item.detail||'')}</div>`:''}<span class="card-foot">CHẠM ĐỂ ${flipped?'XEM LẠI':'HIỆN ĐÁP ÁN'}</span></button><div class="flash-nav"><button class="button outline small" data-action="prev-card" ${i===0?'disabled':''}>← Thẻ trước</button><small>Thẻ ${i+1} / ${cards.length}</small><button class="button outline small" data-action="next-card">${i+1===cards.length?'Về đầu ↻':'Thẻ tiếp →'}</button></div><div class="flash-actions"><button class="button outline" data-action="rate-card" data-rating="again">↻ Chưa nhớ</button><button class="button primary" data-action="rate-card" data-rating="good">✓ Đã nhớ</button></div></div><aside class="flash-side"><div class="eyebrow">ÔN CÁCH QUÃNG</div><h3>${learned?'Đã ôn '+learned.reviews+' lần':'Thẻ chưa ôn'}</h3><p>${learned?.due?'Ngày ôn tiếp: '+learned.due:'Đánh dấu để lưu tiến độ vào trình duyệt.'}</p><div class="progress"><div style="width:${pct(i+1,cards.length)}%"></div></div><button class="button outline small" data-action="speak" data-text="${escapeHTML(item.speak||item.front)}">♫ Nghe tiếng Nhật</button><p>“Đã nhớ” giãn lần ôn tiếp theo từ 1 → 3 → 7 → 14 → 30 ngày. “Chưa nhớ” sẽ được nhắc lại sớm hơn.</p><div class="source-note">Lưu ý: giọng đọc phụ thuộc vào ngôn ngữ có trên máy; nếu không có giọng Nhật, sử dụng cách đọc trong thẻ.</div></aside></div>`;}
function norm(a){return String(a??'').normalize('NFKC').replace(/[\s。、！？!?,.]/g,'').toLowerCase();}
function tokensFor(ex,i){let t=ex.tokens.map((text,original)=>({text,original}));for(let j=t.length-1;j>0;j--){const k=(i*3+j*7+1)%(j+1);[t[j],t[k]]=[t[k],t[j]];}if(t.every((e,j)=>e.original===j)&&t.length>=3)[t[0],t[1]]=[t[1],t[0]];return t;}
function currentAnswer(ex){if(ex.type==='order')return state.orderChoices.map(x=>ex.tokens[x]).join(' ');return state.answers[ex.id]??'';}
// Chấm đọc tiếng Nhật theo các biến thể đã duyệt cho từng đáp án; không tự đoán từ đồng âm.
function canonicalKana(value){return String(value??'').normalize('NFKC').replace(/[\s\u3000]+/g,'').replace(/[｡。．.！？?!、，,]+$/g,'').replace(/[\u30A1-\u30F6]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0x60));}
function rightAnswer(ex,ans){
  if(ex.type==='mc')return Number(ans)===ex.answer;
  if(ex.type==='order')return norm(ans)===norm(ex.answer);
  if(ex.type==='type')return [ex.answer,...(ex.variants||[]),...(ex.also||[])].some(x=>canonicalKana(x)===canonicalKana(ans));
  return [ex.answer,...(ex.also||[])].some(x=>norm(x)===norm(ans));
}
function hintWords(ex){return (ex.hintSegments||[]).map((segment,i)=>`<button type="button" class="hint-word" data-action="insert-hint" data-text="${escapeHTML(segment.text)}" title="Bấm để chèn chữ vào ô viết"><span class="jp">${segment.reading?`<ruby>${escapeHTML(segment.text)}<rt>${escapeHTML(segment.reading)}</rt></ruby>`:escapeHTML(segment.text)}</span></button>`).join('');}

function exercisePanel(l){const exs=l.exercises;const idx=state.practiceIndex;if(idx>=exs.length)return resultPanel(l);const ex=exs[idx];const checked=Boolean(state.checked[ex.id]);const ans=currentAnswer(ex);const ok=checked?rightAnswer(ex,ans):false;let control='';
if(ex.type==='mc')control=`<div class="option-list">${ex.options.map((opt,i)=>`<button class="option ${String(state.answers[ex.id])===String(i)?'selected':''} ${checked&&i===ex.answer?'correct':''} ${checked&&i===Number(ans)&&!ok?'wrong':''}" data-action="select-option" data-option="${i}" ${checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span class="jp">${kanjiDisplay(opt)}</span></button>`).join('')}</div>`;
if(ex.type==='fill'||ex.type==='type'){
 const writing=ex.type==='type';
 control=`<input class="text-answer jp" id="practice-input" lang="ja" inputmode="text" value="${escapeHTML(state.answers[ex.id]||'')}" placeholder="${writing?'Nhập Kanji hoặc Hiragana…':'Điền vào chỗ trống…'}" autocomplete="off" spellcheck="false" ${checked?'disabled':''}/>`;
 if(writing)control+=`<div class="write-tools"><p>✓ Chấp nhận Kanji, Hiragana hoặc viết xen kẽ khi cùng cách đọc. <span class="muted-small">Trên Windows: Win + Space → chọn Japanese Microsoft IME để gõ tiếng Nhật.</span></p><button class="button outline small" type="button" data-action="toggle-hints">${state.hintsOpen[ex.id]?'Ẩn gợi ý':'💡 Gợi ý Kanji / Hiragana'}</button>${state.hintsOpen[ex.id]?`<div class="hint-container"><p class="muted-small">Nhấn từng từ để chèn vào ô. Furigana nằm phía trên chữ Hán.</p><div class="hint-chips">${hintWords(ex)}</div><div class="hint-caption">Các gợi ý là từ khóa để viết câu; bạn vẫn cần kiểm tra trật tự và trợ từ.</div></div>`:''}</div>`;
}

if(ex.type==='order'){const ts=tokensFor(ex,idx);const used=new Set(state.orderChoices);control=`<div class="token-area">${state.orderChoices.length?state.orderChoices.map((tokenId,j)=>`<button class="token jp" data-action="undo-token" data-index="${j}" ${checked?'disabled':''}>${kanjiDisplay(ex.tokens[tokenId])}</button>`).join(''):'<strong>Chạm các mảnh bên dưới để ghép câu đúng thứ tự…</strong>'}</div><div class="tokens">${ts.map(t=>`<button class="token jp ${used.has(t.original)?'chosen':''}" data-action="add-token" data-index="${t.original}" ${used.has(t.original)||checked?'disabled':''}>${kanjiDisplay(t.text)}</button>`).join('')}</div>`;}
return `<div class="practice-layout"><div class="section-head"><div><h2>Luyện ghép câu và ứng dụng</h2><p>${exs.length} câu / buổi · Có bài tự viết câu được chấm điểm. Chữ Hán hoặc cách đọc Hiragana tương đương đều được chấp nhận.</p></div><button class="button outline small" data-action="restart-practice">↻ Làm lại</button></div><div class="panel"><div class="question-head"><div class="eyebrow">CÂU ${idx+1} / ${exs.length} · ${ex.type==='mc'?'CHỌN ĐÁP ÁN':ex.type==='order'?'SẮP XẾP':ex.type==='fill'?'ĐIỀN TỪ':'VIẾT TIẾNG NHẬT · CÓ CHẤM ĐIỂM'}</div><span class="tag green">${Object.values(state.checked).filter(Boolean).length} đã làm</span></div><div class="progress"><div style="width:${pct(idx,exs.length)}%"></div></div><div class="question-title jp">${kanjiDisplay(ex.q)}</div>${control}${checked?`<div class="answer-note ${ok?'good':'bad'}"><strong>${ok?'✓ Chính xác!':'↻ Chưa đúng.'}</strong> ${escapeHTML(ex.why)}${!ok?`<div>Đáp án: <strong class="jp">${kanjiDisplay(ex.type==='mc'?ex.options[ex.answer]:ex.answer)}</strong></div>`:''}${ex.type==='type'?`<div>Hiragana: <strong class="jp">${escapeHTML(ex.kana||'')}</strong></div>`:''}</div>`:''}<div class="button-row">${!checked?`<button class="button primary" data-action="check-practice" ${String(ans).trim()===''?'disabled':''}>Kiểm tra đáp án</button>`:`<button class="button primary" data-action="next-question">${idx===exs.length-1?'Xem kết quả →':'Câu tiếp theo →'}</button>`}${ex.type==='order'&&!checked?'<button class="button outline" data-action="clear-order">Xóa câu đã ghép</button>':''}</div></div></div>`;}
function resultPanel(l){const count=l.exercises.filter(ex=>rightAnswer(ex,state.answers[ex.id])).length;const percent=Math.round(count/l.exercises.length*100);return `<div class="panel complete"><div class="eyebrow">HOÀN THÀNH BÀI LUYỆN</div><div class="complete-score">${percent}%</div><h2>${percent>=80?'Xuất sắc! Bạn đã đạt mục tiêu.':'Tiếp tục ôn thêm một chút nhé.'}</h2><p class="muted">Bạn trả lời đúng ${count}/${l.exercises.length} câu. Mục tiêu đạt từ 80% trở lên.</p><div class="button-row" style="justify-content:center"><button class="button outline" data-action="restart-practice">↻ Luyện lại</button><button class="button primary" data-action="lesson-tab" data-tab="cards">Ôn flashcard →</button><button class="button outline" data-action="nav" data-view="dashboard">Các buổi khác</button></div></div>`;}
function getDueReview(){const allowed=DATA.lessons.filter(l=>progress.visited.includes(l.id));const all=allowed.flatMap(cardList);const d=today();return all.filter(c=>!progress.cards[c.id]||progress.cards[c.id].due<=d).slice(0,20);}
function reviewScreen(){const items=state.reviewQueue.length?state.reviewQueue:getDueReview();state.reviewQueue=items;pageShell(`<div class="section-head"><div><div class="eyebrow">ÔN TẬP CÁ NHÂN</div><h1>Đến giờ nhớ lại.</h1><p>Luyện thẻ đã học và thẻ đến hạn; mỗi lượt tối đa 20 thẻ.</p></div><button class="button outline small" data-action="reload-review">↻ Làm mới</button></div>${flashUI(items,true)}`);}
function libraryScreen(){pageShell(`<div class="section-head"><div><div class="eyebrow">TRA CỨU NGUỒN HỌC</div><h1>Thư viện ${level}</h1><p>${DATA.counts.groups} nhóm từ vựng · ${DATA.counts.kanji} Kanji · ${DATA.grammarLibrary.length} mẫu đã biên soạn thành thẻ học.</p></div></div><div class="filterbar">${[['vocab','Từ vựng'],['kanji','Kanji'],['grammar','Ngữ pháp']].map(([id,n])=>`<button class="filter-chip ${state.libraryMode===id?'active':''}" data-action="library-mode" data-mode="${id}">${n}</button>`).join('')}</div><div class="search-row"><input id="library-search" class="search-input" placeholder="Tìm chữ Nhật, nghĩa tiếng Việt, Hán Việt…" value="${escapeHTML(state.search)}" aria-label="Tìm trong thư viện"/><select class="select" id="chapter-select" aria-label="Lọc bài"><option value="0">Tất cả các bài</option>${Array.from({length:Math.max(...DATA.vocabGroups.map(g=>g.chapter))},(_,i)=>`<option value="${i+1}" ${state.chapterFilter===i+1?'selected':''}>Bài ${String(i+1).padStart(2,'0')}</option>`).join('')}</select></div><div id="library-content">${libraryContent()}</div>`);}
function libraryContent(){const q=state.search.trim().toLowerCase();if(state.libraryMode==='vocab'){
const groups=DATA.vocabGroups.filter(g=>(state.chapterFilter===0||g.chapter===state.chapterFilter)&&(!q||g.label.toLowerCase().includes(q)||g.words.some(w=>(w.jp+w.meaning).toLowerCase().includes(q))));
if(!groups.length)return `<div class="empty-result">Không tìm thấy nhóm/từ vựng phù hợp.</div>`;
const chosen=groups.find(g=>g.id===state.groupId)||groups[0];return `<div class="library-duo"><div class="group-list">${groups.map(g=>`<button class="group-item ${g.id===chosen.id?'active':''}" data-action="group" data-id="${g.id}">${escapeHTML(g.label)} <span class="muted-small">(${g.words.length})</span></button>`).join('')}</div><div class="panel"><div class="section-head"><div><h2>${escapeHTML(chosen.label)}</h2><p>${chosen.words.length} mục · giữ cách đọc Kana, không Romaji</p></div><button class="button outline small" data-action="export-group" data-id="${chosen.id}">⇩ Quizlet TXT</button></div><div class="list-rows">${chosen.words.map(w=>`<div class="list-row visual-library-row">${visualCard(w,"library-vocab-img")}<div class="jp">${kanjiDisplay(w.jp)}</div><div style="text-align:right"><small>${escapeHTML(w.meaning)}</small><button class="speak-inline" style="margin-left:8px" data-action="speak" data-text="${escapeHTML(reading(w.jp))}">♫</button></div></div>`).join('')}</div><div class="source-note">Từ vựng ${level} lấy từ tài liệu bạn cung cấp. Một số dòng đã trích xuất tự động cần đối chiếu với PDF khi có ghi chú đặc biệt.</div></div></div>`;}
if(state.libraryMode==='kanji'){const ks=DATA.kanjiLibrary.filter(k=>(state.chapterFilter===0||k.chapter===state.chapterFilter)&&(!q||(k.ch+k.hv+k.kun+k.on).toLowerCase().includes(q)));return `<div class="subheading"><h2>${ks.length} chữ Hán</h2><span>Âm On / Kun trong bộ Kanji ${level}</span></div><div class="library-kanji-grid">${ks.map(k=>`<div class="kanji-library-item"><div class="symbol jp">${escapeHTML(k.ch)}</div><strong>${escapeHTML(k.hv)}</strong><small>On: ${escapeHTML(k.on||"—")}</small><small>Kun: ${escapeHTML(k.kun||"—")}</small>${k.note?'<span class="tag warm">Có hiệu đính</span>':''}</div>`).join('')}</div>${ks.length===0?'<div class="empty-result">Không tìm thấy Kanji phù hợp.</div>':''}<div class="source-note">${level==='N5'?'Kanji N5 từ bộ tài liệu trước đây.':'Kanji N4 gồm các chữ đã số hóa; On/Kun trích từ các ô chữ gốc theo trang.'}</div>`;}
const g=DATA.grammarLibrary.filter(x=>!q||(x.id+x.pattern+x.meaning+x.note).toLowerCase().includes(q));return `<div class="subheading"><h2>${g.length} mẫu ngữ pháp</h2><span>Đã chuẩn bị để tra cứu và học trong lộ trình ${level}</span></div><div class="grammar-library-grid">${g.map(x=>`<div class="grammar-item"><div class="eyebrow">MẪU ${escapeHTML(x.id)} ${x.needsReview?"· CẦN ĐỐI CHIẾU PDF":""}</div><div class="formula jp">${kanjiDisplay(x.pattern)}</div><strong>${escapeHTML(x.meaning)}</strong><p>${escapeHTML(x.note)}</p>${x.example?`<div class="ex"><div class="jp">${kanjiDisplay(x.example)}</div><small>${escapeHTML(x.translation)}</small></div>`:`<div class="source-note">Xem ví dụ trong ${escapeHTML(x.source||"PDF gốc")}</div>`}<small>${escapeHTML(x.source)}</small></div>`).join('')}</div>${g.length===0?'<div class="empty-result">Không tìm thấy cấu trúc.</div>':''}<div class="source-note">Ngữ pháp đang được kiểm tra theo tài liệu của từng trình độ; tránh học thuộc những dòng bị lỗi trích xuất PDF.</div>`;}

// ================= V7 GAMES =================
function gameSources(){
  const g=state.game;
  if(g.scope==='studied'){
    const ids=new Set(progress.visited||[]);
    return DATA.lessons.filter(l=>ids.has(l.id));
  }
  return [DATA.lessons.find(l=>l.id===g.lessonId)||lesson()];
}
function wordWritingForms(jp){
  const raw=String(jp||'').trim();
  if(raw.includes('～')||raw.startsWith('（')||raw.includes('／'))return null;
  const form=raw.match(/^([^（）]+)（([^（）]+)）$/);
  if(form){
    if(form[2].includes('する')||form[1].includes('（'))return null;
    return {main:form[1],kana:form[2]};
  }
  if(/[（）]/.test(raw))return null;
  return {main:raw,kana:/^[\u3040-\u30ffー・\s]+$/.test(raw)?raw:''};
}
const shuffled=(items)=>{
  const arr=[...items];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;
};
function gameQuestions(mode){
  const all=gameSources().flatMap(l=>l.vocab.map(w=>({...w,sourceLesson:l.id}))).filter(w=>w.jp&&w.meaning);
  const uniq=[];const seen=new Set();
  for(const w of all){if(!seen.has(w.jp)){seen.add(w.jp);uniq.push(w);}}
  const selected=shuffled(uniq);
  if(mode==='picture'){
    const available=selected.filter(w=>visualKey(w));const sourcePool=uniq.filter(w=>wordWritingForms(w.jp));
    return available.map(w=>{
      const others=shuffled(sourcePool.filter(x=>x.jp!==w.jp&&x.meaning!==w.meaning)).slice(0,3);
      if(others.length<3)return null;
      const options=shuffled([w,...others]);
      return {kind:'picture',key:'picture:'+w.jp,word:w,direction:'image-to-jp',options,correct:options.findIndex(x=>x.jp===w.jp)};
    }).filter(Boolean).slice(0,10);
  }
  if(mode==='quiz'){
    const optionsPool=uniq.filter(w=>w.meaning&&w.jp);
    return selected.map((w,i)=>{
      const others=shuffled(optionsPool.filter(x=>x.jp!==w.jp&&x.meaning!==w.meaning));
      const direction=i%2===0?'jp-to-vi':'vi-to-jp';
      const answers=[w,...others.filter(x=>direction==='jp-to-vi' ? x.meaning!==w.meaning : x.jp!==w.jp).slice(0,3)];
      if(answers.length<4)return null;
      const opts=shuffled(answers);
      return {kind:'quiz',key:w.jp,word:w,direction,options:opts,correct:opts.findIndex(x=>x.jp===w.jp)};
    }).filter(Boolean).slice(0,10);
  }
  if(mode==='typing'){
    return selected.map(w=>({kind:'typing',key:w.jp,word:w,forms:wordWritingForms(w.jp)})).filter(q=>q.forms).slice(0,10);
  }
  if(mode==='sentence'){
    const pool=[];const dedup=new Set();
    for(const l of gameSources()){
      for(const ex of l.exercises){
        if(ex.type!=='type'||!ex.kana||!/(?:viết câu|hãy viết câu|viết bằng tiếng nhật.*[。])/i.test(ex.q))continue;
        const key=canonicalKana(ex.kana);
        if(dedup.has(key))continue;
        dedup.add(key);
        pool.push({kind:'sentence',key:'sentence:'+key,sourceLesson:l.id,meaning:ex.q,answer:ex.answer,kana:ex.kana,variants:ex.variants||[],hints:ex.hintSegments||[],explanation:ex.why||''});
      }
    }
    // Complement lesson's existing graded sentence with short use-in-context sentences based on studied nouns.
    const nounEnding=/^(?:cái |quyển |cuốn |chiếc |đồ |hàng |một |tờ |cốc |xe |sách|bút|vở|bánh|đồng hồ|ví|từ điển|hộp|máy tính|áo|giày|bàn|ghế|nước)/i;
    const countries=/^(?:Việt Nam|Nhật Bản|Trung Quốc|Hàn Quốc|Thái Lan|Ấn Độ|Mỹ|Pháp|Đức|Anh)$/i;
    const professions=/^(?:bác sĩ|giáo viên|giảng viên|thầy|cô giáo|nhân viên|sinh viên|học sinh|người [^.,;]+)/i;
    const compatible=selected.filter(w=>{
      const f=wordWritingForms(w.jp);return f && !/（する）|（します）|たい|ます$/.test(w.jp) && (nounEnding.test(w.meaning)||countries.test(w.meaning)||professions.test(w.meaning));
    });
    for(const w of compatible){
      const f=wordWritingForms(w.jp);
      for(const question of [false,true]){
        const suffix=question?'ですか。':'です。';
        const person=professions.test(w.meaning);
        const prefix=person?'あの人は':'これは';
        const kanaPrefix=person?'あのひとは':'これは';
        const key=`vocab:${w.jp}:${suffix}`;
        if(dedup.has(key))continue;
        dedup.add(key);
        pool.push({kind:'sentence',key,sourceLesson:w.sourceLesson,meaning:person?`Hãy viết câu: “Người kia ${question?'có phải là':'là'} ${w.meaning}${question?' không?':'.'}”`:countries.test(w.meaning)?`Nhìn bản đồ, hãy viết câu: “Đây ${question?'có phải là':'là'} ${w.meaning}${question?' không?':'.'}”`:`Hãy viết câu: “Đây ${question?'có phải là':'là'} ${w.meaning}${question?' không?':'.'}”`,answer:`${prefix}${f.main}${suffix}`,kana:f.kana?`${kanaPrefix}${f.kana}${suffix}`:'',variants:[],hints:[{text:person?'あの人':'これ',reading:person?'あのひと':''},{text:'は',reading:''},{text:f.main,reading:f.kana||''},{text:suffix,reading:''}],explanation:`Ôn từ ${w.jp}: ${w.meaning}.`});
      }
      if(pool.length>=10)break;
    }
    return shuffled(pool).slice(0,8);
  }
  return [];
}
function prepareGame(){
 const g=state.game;
 g.questions=gameQuestions(g.mode);g.index=0;g.selected=null;g.input='';g.checked=false;g.points=0;g.streak=0;g.bestStreak=0;g.results=[];g.finished=false;g.started=g.questions.length>0;g.usedHint=false;g.hintOpen=false;g.freeInput='';g.freeWord='';g.freeResult='';
 if(!g.started)notify('Chưa có đủ dữ liệu phù hợp với chế độ này. Hãy chọn buổi khác hoặc mở thêm buổi đã học.');
}
function gameCorrect(q,g){
 if(q.kind==='quiz'||q.kind==='picture')return Number(g.selected)===q.correct;
 const got=canonicalKana(g.input);
 if(q.kind==='typing')return [q.forms.main,q.forms.kana].filter(Boolean).some(x=>canonicalKana(x)===got);
 return [q.answer,q.kana,...(q.variants||[])].filter(Boolean).some(x=>canonicalKana(x)===got);
}
function retryWrongQuestions(){
 const g=state.game;
 const wrong=new Set(g.results.filter(r=>!r.ok).map(r=>r.key));
 const pending=g.questions.filter(q=>wrong.has(q.key));
 if(!pending.length){notify('Bạn đã làm đúng tất cả câu, không có câu sai để luyện lại!');return;}
 g.questions=shuffled(pending);g.index=0;g.input='';g.selected=null;g.checked=false;g.usedHint=false;g.hintOpen=false;g.points=0;g.streak=0;g.bestStreak=0;g.results=[];g.finished=false;g.started=true;
}
function completeGame(){
 const g=state.game;g.finished=true;
 const old=progress.games[g.mode]||{plays:0,best:0,totalCorrect:0,total:0};
 const correct=g.results.filter(x=>x.ok).length;
 progress.games[g.mode]={plays:old.plays+1,best:Math.max(old.best,g.points),totalCorrect:old.totalCorrect+correct,total:old.total+g.questions.length};
 activity();save();
}
function gradeGame(){
 const g=state.game,q=g.questions[g.index];if(!q||g.checked)return;
 if((q.kind==='quiz'||q.kind==='picture')&&g.selected===null){notify('Hãy chọn một đáp án.');return;}
 if(q.kind!=='quiz'&&q.kind!=='picture'&&!g.input.trim()){notify('Hãy gõ câu trả lời bằng chữ Nhật trước.');return;}
 const ok=gameCorrect(q,g),earned=ok?(g.usedHint?5:10):0;
 g.points+=earned;g.streak=ok?g.streak+1:0;g.bestStreak=Math.max(g.bestStreak,g.streak);g.checked=true;
 g.results.push({key:q.key,ok,points:earned});
 if(q.kind!=='sentence'){
   const prev=progress.wordPractice[q.word.jp]||{correct:0,wrong:0};
   if(ok)prev.correct++;else prev.wrong++;
   progress.wordPractice[q.word.jp]=prev;
 }
 save();
}
function nextGameQuestion(){
 const g=state.game;if(!g.checked)return;
 if(g.index+1>=g.questions.length){completeGame();return;}
 g.index++;g.input='';g.selected=null;g.checked=false;g.usedHint=false;g.hintOpen=false;
}
function currentGameQuestion(){return state.game.questions[state.game.index];}
function gameHeader(title,sub){return `<div class="section-head"><div><div class="eyebrow">🎮 GAME ZONE · ${level}</div><h1>${title}</h1><p>${sub}</p></div><span class="tag green">12 từ mới / buổi tối đa</span></div>`;}
function gameContent(){
 const g=state.game;const insideLesson=state.view==='lesson';
 const modes=[['quiz','🧩','Trắc nghiệm','Nhận diện từ và nghĩa'],['picture','🖼️','Nhìn ảnh đoán từ','Nhìn hình và chọn chữ Nhật'],['typing','⌨️','Gõ tiếng Nhật','Nhớ cách viết Kanji / Kana'],['sentence','📝','Đặt câu','Gõ câu với từ đã học']];
 let body=`${gameHeader('Học vui — nhớ từ thật lâu','Chọn một trò chơi. Mặc định chỉ sử dụng từ của buổi này; có thể trộn các buổi đã mở.')}
 <div class="game-mode-grid">${modes.map(([id,emoji,name,desc])=>`<button class="game-mode ${g.mode===id?'selected':''}" data-action="game-mode" data-mode="${id}"><span class="game-mode-emoji">${emoji}</span><strong>${name}</strong><small>${desc}</small></button>`).join('')}</div>
 <div class="game-settings"><label>Phạm vi học <select id="game-scope" class="select" ${g.started&&!g.finished?'disabled':''}><option value="lesson" ${g.scope==='lesson'?'selected':''}>Một buổi học</option><option value="studied" ${g.scope==='studied'?'selected':''}>Trộn các buổi đã mở</option></select></label>
 ${g.scope==='lesson'?`<label>Buổi học <select id="game-lesson" class="select" ${g.started&&!g.finished?'disabled':''}>${DATA.lessons.filter(l=>(progress.visited||[]).includes(l.id)||l.id===state.lessonId).map(l=>`<option value="${escapeHTML(l.id)}" ${g.lessonId===l.id?'selected':''}>${escapeHTML(l.title)}</option>`).join('')}</select></label>`:''}<span class="game-level-note">${g.scope==='studied'?`${gameSources().length} buổi đã mở`:'Từ vựng đúng buổi đã chọn'} · Không Romaji</span></div>`;
 if(g.started&&!g.finished){
 body=`<div class="game-compact-top" id="game-play-top"><div><span class="eyebrow">🎮 ${level} · ${escapeHTML(g.mode.toUpperCase())}</span><strong>${escapeHTML(modes.find(x=>x[0]===g.mode)?.[2]||'Trò chơi')}</strong></div><label class="game-auto-toggle"><input type="checkbox" id="game-auto-next" ${g.autoNext?'checked':''}><span>Tự chuyển sau 1,7 giây</span></label><button class="button outline small" data-action="game-exit">← Đổi chế độ</button></div>`;
 }
 if(!g.started){body+=`<div class="game-intro"><div class="game-intro-icon">${g.mode==='quiz'?'🎯':g.mode==='picture'?'🖼️':g.mode==='typing'?'⌨️':'🗣️'}</div><h2>${g.mode==='quiz'?'Trắc nghiệm nhớ nghĩa':g.mode==='picture'?'Nhìn ảnh đoán từ':g.mode==='typing'?'Gõ từ Nhật theo nghĩa':'Tập viết câu hoàn chỉnh'}</h2><p>${g.mode==='quiz'?'10 câu chọn đáp án, có chuỗi đúng liên tiếp.':g.mode==='picture'?'Chọn chữ Nhật đúng cho hình của từ đã học. Nếu chưa có ảnh, hãy chọn buổi khác.':g.mode==='typing'?'Gõ Kanji hoặc cách đọc Kana đã có trong tài liệu. Gợi ý trừ một nửa điểm câu đó.':'Dùng những mẫu câu đã học, chấm các đáp án Kanji và Hiragana được khai báo; có thêm khu vực sáng tạo câu tự do.'}</p><button class="button primary game-start" data-action="game-start">Bắt đầu thử thách →</button></div>`;return body;}
 if(g.finished){
 const correct=g.results.filter(r=>r.ok).length;
 body+=`<div class="game-summary"><div class="game-trophy">🏆</div><div class="eyebrow">ĐÃ HOÀN THÀNH</div><h2>${g.points} điểm</h2><p>Đúng <strong>${correct}/${g.questions.length}</strong> câu · Chuỗi tốt nhất <strong>${g.bestStreak} 🔥</strong></p><div class="game-actions"><button class="button primary" data-action="game-start">↻ Chơi lại</button>${correct<g.questions.length?`<button class="button outline" data-action="game-retry-wrong">🔁 Luyện lại ${g.questions.length-correct} câu sai</button>`:''}<button class="button outline" data-action="game-mode" data-mode="${g.mode}">Chọn chế độ / buổi khác</button></div></div>`;
 if(g.mode==='sentence')body+=freeWritingPanel();
 return body;
 }
 const q=currentGameQuestion();
 body+=`<div class="game-play-panel"><div class="game-score"><span>⭐ <strong>${g.points}</strong> điểm</span><span>🔥 Chuỗi <strong>${g.streak}</strong></span><span>Câu ${g.index+1}/${g.questions.length}</span></div><div class="game-progress"><div style="width:${pct(g.index,g.questions.length)}%"></div></div>`;
 if(q.kind==='quiz'||q.kind==='picture'){
  body+=`<div class="game-question">${q.kind==='picture'?`<div class="picture-question-media">${visualCard(q.word,'game-photo')}</div>`:''}<div class="eyebrow">${q.direction==='jp-to-vi'?'NHẬT → VIỆT':'VIỆT → NHẬT'}</div><h2 class="game-big-word jp">${q.kind==='picture'?'Nhìn ảnh và chọn từ':q.direction==='jp-to-vi'?kanjiDisplay(q.word.jp):escapeHTML(q.word.meaning)}</h2><p>${q.kind==='picture'?'Bức hình này tương ứng với từ nào?':q.direction==='jp-to-vi'?'Từ này có nghĩa là gì?':'Chọn cách viết tiếng Nhật đúng:'}</p><div class="game-answers">${q.options.map((o,i)=>`<button data-action="game-select" data-index="${i}" class="game-answer ${g.selected===i?'selected':''} ${g.checked&&i===q.correct?'correct':''} ${g.checked&&g.selected===i&&i!==q.correct?'wrong':''}" ${g.checked?'disabled':''}><span class="answer-letter">${String.fromCharCode(65+i)}</span><span class="jp">${q.kind!=='picture'&&q.direction==='jp-to-vi'?escapeHTML(o.meaning):kanjiDisplay(o.jp)}</span></button>`).join('')}</div></div>`;
 }else{
  body+=`<div class="game-question"><div class="eyebrow">${q.kind==='typing'?'⌨️ GÕ TỪ VỰNG':'📝 LUYỆN ĐẶT CÂU'}</div><h2 class="game-prompt">${q.kind==='typing'?`${visualKey(q.word)?visualCard(q.word,'game-typing-photo'):''}${escapeHTML(q.word.meaning)}`:escapeHTML(q.meaning)}</h2><p>${q.kind==='typing'?'Hãy gõ từ tiếng Nhật tương ứng.':'Hãy gõ thành một câu tiếng Nhật hoàn chỉnh.'}</p><input id="game-input" class="text-answer jp game-input" lang="ja" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" ${g.checked?'disabled':''} placeholder="${q.kind==='typing'?'Gõ chữ Nhật / Hiragana…':'Nhập câu tiếng Nhật…'}" value="${escapeHTML(g.input)}"/><div class="game-keyboard-hint">💡 Trên Windows: Win + Space → Japanese IME. Có thể sử dụng gợi ý nếu chưa nhớ chữ Hán.</div>${!g.checked?`<button class="button outline small" data-action="game-hint">${g.hintOpen?'Ẩn gợi ý':'Hiện gợi ý (câu này tối đa 5 điểm)'}</button>${g.hintOpen?`<div class="game-hints">${q.kind==='typing'?`<button class="hint-word" data-action="game-insert" data-text="${escapeHTML(q.forms.main)}">${kanjiDisplay(q.word.jp)}</button>${q.forms.kana?`<button class="hint-word" data-action="game-insert" data-text="${escapeHTML(q.forms.kana)}">${escapeHTML(q.forms.kana)}</button>`:''}`:(q.hints||[]).map(h=>`<button class="hint-word" data-action="game-insert" data-text="${escapeHTML(h.text)}">${h.reading?`<ruby>${escapeHTML(h.text)}<rt>${escapeHTML(h.reading)}</rt></ruby>`:escapeHTML(h.text)}</button>`).join('')}</div>`:''}`:''}</div>`;
 }
 if(g.checked){const last=g.results.at(-1),correct=(q.kind==='quiz'||q.kind==='picture')?q.options[q.correct].jp:q.kind==='typing'?q.forms.main:q.answer;
 body+=`<div class="game-feedback ${last.ok?'correct':'wrong'}"><strong>${last.ok?`✅ Đúng rồi! +${last.points} điểm`:'💡 Chưa đúng — xem lại nhé'}</strong><div class="jp">${kanjiDisplay(correct)}</div>${q.kind==='typing'?`<small>${escapeHTML(q.word.meaning)}${q.forms.kana?' · '+escapeHTML(q.forms.kana):''}</small>`:q.kind==='sentence'?`<small>Hiragana mẫu: ${escapeHTML(q.kana||'Không có phiên âm được đối chiếu')}</small>`:''}</div>`;
 }
 body+=`<div class="game-actions game-float-actions" role="status"><span class="game-action-summary">${g.checked?(g.results.at(-1)?.ok?`✅ Đúng +${g.results.at(-1)?.points} điểm`:`🧠 Chưa đúng`):`⌨️ Enter để chấm nhanh`}</span>${g.checked?`<button class="button primary" data-action="game-next">${g.index===g.questions.length-1?'Xem kết quả →':'Câu tiếp theo →'}</button>${g.autoNext?'<span class="next-countdown">Tự chuyển <i></i></span>':''}`:`<button class="button primary" data-action="game-check" ${(q.kind==='quiz'||q.kind==='picture')?(g.selected===null?'disabled':''):(g.input.trim()?'':'disabled')}>Chấm đáp án</button>`}<button class="button outline game-quit" data-action="game-exit">Đổi trò chơi</button></div></div>`;
 return body;
}
function freeWritingPanel(){
 const g=state.game;const l=DATA.lessons.find(x=>x.id===g.lessonId)||lesson();
 const terms=l.vocab.filter(w=>wordWritingForms(w.jp)).slice(0,5);
 const chosen=terms.find(w=>w.jp===g.freeWord)||terms[0];
 if(!chosen)return '';
 return `<section class="panel free-sentence-panel"><h3>🌱 Thử tự sáng tạo câu mới</h3><p>Hãy tự đặt câu có dùng một trong các từ đã học. Phần này kiểm tra bạn có sử dụng từ mục tiêu, <strong>không chấm đúng/sai toàn bộ ngữ pháp</strong>.</p><div class="free-word-picker">${terms.map(w=>`<button class="filter-chip ${chosen.jp===w.jp?'active':''}" data-action="game-free-word" data-word="${escapeHTML(w.jp)}">${kanjiDisplay(w.jp)}</button>`).join('')}</div><div class="game-target"><span>Từ cần dùng:</span> <strong class="jp">${kanjiDisplay(chosen.jp)}</strong><small>${escapeHTML(chosen.meaning)}</small></div><textarea id="game-free-input" class="free-jp-input jp" lang="ja" rows="3" placeholder="Tự viết câu của bạn bằng chữ Nhật…">${escapeHTML(g.freeInput)}</textarea><div class="game-actions"><button class="button primary" data-action="game-free-check">Kiểm tra từ đã dùng</button><button class="button outline" data-action="game-free-clear">Xóa và viết lại</button></div>${g.freeResult?`<div class="game-feedback ${g.freeResult==='ok'?'correct':'wrong'}">${g.freeResult==='ok'?'✅ Bạn đã sử dụng từ mục tiêu trong câu. Hãy tự xem lại trợ từ, chia thể và ý nghĩa.':'Hãy đưa từ mục tiêu vào câu bằng Kanji hoặc cách đọc Kana có trong tài liệu.'}</div>`:''}</section>`;
}
function gameScreen(){pageShell(gameContent());}
// =============== END GAMES ===================

function statsScreen(){const s=progressStats();const activities=Object.entries(progress.activity).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7);pageShell(`<div class="section-head"><div><div class="eyebrow">HỌC THEO TIẾN BỘ THỰC TẾ</div><h1>Nhìn thấy sự tiến bộ.</h1><p>Chỉ thống kê các thao tác bạn làm trên trình duyệt này.</p></div></div><div class="stat-grid"><div class="stat-card"><span class="number">${s.passed}/${DATA.lessons.length}</span><span class="label">Bài đạt từ 80%</span></div><div class="stat-card"><span class="number">${s.known}</span><span class="label">Thẻ nhớ được</span></div><div class="stat-card"><span class="number">${s.reviewed}</span><span class="label">Thẻ từng ôn</span></div><div class="stat-card"><span class="number">${s.percent}%</span><span class="label">Tiến độ các buổi tích hợp</span></div></div><div class="panel"><h3>Kết quả theo từng buổi</h3><div class="list-rows">${DATA.lessons.map(l=>`<div class="list-row"><span style="min-width:170px">${escapeHTML(l.id)} · ${escapeHTML(l.title)}</span><div class="progress" style="flex:1;min-width:70px"><div style="width:${score(l)}%"></div></div><span class="muted-small">${score(l)}%</span></div>`).join('')}</div></div><div class="panel"><h3>Lịch sử hoạt động gần đây</h3>${activities.length?`<div class="list-rows">${activities.map(([d,num])=>`<div class="list-row"><span>${escapeHTML(d)}</span><span class="muted-small">${num} lần tương tác học</span></div>`).join('')}</div>`:'<p class="muted-small">Hãy bắt đầu ôn thẻ hoặc làm bài tập để hiển thị hoạt động.</p>'}</div><div class="panel"><h3>🎮 Kết quả trò chơi từ vựng</h3><div class="stat-grid game-result-stats">${[['quiz','Trắc nghiệm'],['picture','Nhìn ảnh'],['typing','Gõ từ Nhật'],['sentence','Viết câu']].map(([id,name])=>`<div class="stat-card"><strong>${name}</strong><span class="number">${progress.games?.[id]?.best||0}</span><span class="label">Điểm cao nhất · ${progress.games?.[id]?.plays||0} lượt</span></div>`).join('')}</div><p class="panel-desc">Điểm trò chơi và từ thường làm sai được lưu riêng cho ${level}.</p></div><div class="panel"><h3>Quản lý dữ liệu học tập</h3><p class="panel-desc">Không có tài khoản, máy chủ hay đồng bộ đám mây. Bạn có thể lưu bản sao tiến độ JSON và phục hồi bằng cách dùng tệp đó trên cùng ứng dụng.</p><div class="button-row"><button class="button primary" data-action="backup">⇩ Sao lưu tiến độ JSON</button><label class="button outline" style="cursor:pointer">↑ Khôi phục từ JSON<input id="restore-input" type="file" accept=".json,application/json" style="display:none"></label><button class="button outline" data-action="reset-all">Xóa tiến độ trên máy này</button></div></div>`);}
function notify(msg){let old=document.querySelector('.toast');if(old)old.remove();const d=document.createElement('div');d.className='toast';d.role='status';d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),3500);}
function download(filename,text,type='text/plain;charset=utf-8'){const blob=new Blob(['\uFEFF',text],{type});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);}
function exportQuizlet(){const l=lesson();const cards=cardList(l);download(`${level}_${l.id}_Quizlet_2_cot.txt`,cards.map(c=>`${c.front.replace(/[\t\r\n]+/g,' ')}\t${c.back.replace(/[\t\r\n]+/g,' ')}`).join('\n'));notify('Đã tạo TXT 2 cột để nhập Quizlet.');}
function exportGroup(id){const g=DATA.vocabGroups.find(g=>g.id===id);if(!g)return;download(`${level}_${g.id}_Quizlet.txt`,g.words.map(w=>`${w.jp.replace(/[\t\n]+/g,' ')}\t${w.meaning.replace(/[\t\n]+/g,' ')}`).join('\n'));notify('Đã tạo file Quizlet từ nhóm từ vựng.');}
function speak(text){if(!('speechSynthesis'in window)){notify('Trình duyệt này không hỗ trợ đọc tiếng Nhật.');return;}try{speechSynthesis.cancel();const utt=new SpeechSynthesisUtterance(text);utt.lang='ja-JP';utt.rate=.82;const voices=speechSynthesis.getVoices();const v=voices.find(v=>v.lang==='ja-JP')||voices.find(v=>v.lang.startsWith('ja'));if(v)utt.voice=v;speechSynthesis.speak(utt);}catch(e){notify('Không phát được âm thanh trên thiết bị này.');}}
function noteCard(id,rating){const prev=progress.cards[id]||{reviews:0,ok:0,interval:0,due:today()};const next=rating==='good'?(prev.interval===0?1:prev.interval<=1?3:prev.interval<=3?7:prev.interval<=7?14:30):1;progress.cards[id]={reviews:prev.reviews+1,ok:prev.ok+(rating==='good'?1:0),interval:next,due:dateAdd(next)};activity();}
function makeReview(){state.reviewQueue=getDueReview();state.reviewIdx=0;state.reviewFlip=false;}
function goto(view){if(view!=='games')cancelGameAdvance();state.view=view;if(view==='review')makeReview();render();window.scrollTo({top:0,behavior:'instant'});}
function resetPractice(){state.practiceIndex=0;state.answers={};state.checked={};state.orderChoices=[];state.hintsOpen={};}
function grade(){const ex=lesson().exercises[state.practiceIndex];let v=currentAnswer(ex);if(!String(v).trim()){notify('Hãy trả lời trước khi kiểm tra.');return;}state.answers[ex.id]=v;state.checked[ex.id]=true;activity();render();}
function finishPractice(){const l=lesson();const count=l.exercises.filter(x=>rightAnswer(x,state.answers[x.id])).length;const res=Math.round(count/l.exercises.length*100);const old=progress.scores[l.id]||{best:0};progress.scores[l.id]={best:Math.max(old.best||0,res),last:res,attempts:(old.attempts||0)+1,date:today()};save();}
function render(){if(state.view==='dashboard')dashboard();else if(state.view==='lesson')lessonScreen();else if(state.view==='review')reviewScreen();else if(state.view==='library')libraryScreen();else if(state.view==='stats')statsScreen();else if(state.view==='games')gameScreen();else dashboard();}
// Sự kiện tập trung: dữ liệu học nằm trong data.js, các điều khiển hoạt động hoàn toàn ngoại tuyến.
document.addEventListener('click',e=>{
const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
if(a==='select-level'){selectLevel(b.dataset.level);return;}
if(a==='open-game'){const id=b.dataset.id||state.lessonId;state.lessonId=id;state.game=newGameState();state.game.lessonId=id;state.view='games';render();window.scrollTo(0,0);return;}
if(a==='game-mode'){cancelGameAdvance();state.game.mode=b.dataset.mode;state.game.started=false;state.game.finished=false;state.game.questions=[];render();return;}
if(a==='game-start'){cancelGameAdvance();prepareGame();render();afterGameRender();return;}
if(a==='game-retry-wrong'){cancelGameAdvance();retryWrongQuestions();render();afterGameRender();return;}
if(a==='game-restart'){cancelGameAdvance();state.game.started=false;state.game.finished=false;state.game.questions=[];render();return;}
if(a==='game-select'){if(!state.game.checked){state.game.selected=Number(b.dataset.index);gradeGame();render();scheduleGameAdvance();}return;}
if(a==='game-hint'){if(!state.game.checked){state.game.hintOpen=!state.game.hintOpen;state.game.usedHint=true;render();}return;}
if(a==='game-insert'){if(state.game.checked)return;const field=document.getElementById('game-input');if(!field)return;const t=b.dataset.text||'';const position=field.selectionStart??field.value.length;field.value=field.value.slice(0,position)+t+field.value.slice(position);field.focus();field.setSelectionRange(position+t.length,position+t.length);state.game.input=field.value;const check=document.querySelector('[data-action="game-check"]');if(check)check.disabled=!field.value.trim();return;}
if(a==='game-check'){const field=document.getElementById('game-input');if(field)state.game.input=field.value;gradeGame();render();scheduleGameAdvance();return;}
if(a==='game-next'){cancelGameAdvance();nextGameQuestion();render();afterGameRender();return;}
if(a==='game-exit'){cancelGameAdvance();state.game.started=false;state.game.finished=false;state.game.questions=[];render();return;}
if(a==='game-free-word'){state.game.freeWord=b.dataset.word;state.game.freeResult='';render();return;}
if(a==='game-free-clear'){state.game.freeInput='';state.game.freeResult='';render();return;}
if(a==='game-free-check'){const g=state.game;const field=document.getElementById('game-free-input');if(field)g.freeInput=field.value;const l=DATA.lessons.find(x=>x.id===g.lessonId)||lesson();const selectedWord=g.freeWord||l.vocab.find(w=>wordWritingForms(w.jp))?.jp||'';const forms=wordWritingForms(selectedWord);const result=canonicalKana(g.freeInput);g.freeResult=forms&&[forms.main,forms.kana].filter(Boolean).some(v=>result.includes(canonicalKana(v)))?'ok':'no';render();return;}

if(a==='nav'){goto(b.dataset.view);return;}
if(a==='help'){alert('MỞ APP: Giải nén ZIP hoặc mở HTML độc lập. Chọn N5/N4 trên thanh trình độ.\n\nBẮT ĐẦU: Mở buổi 01 → Tìm hiểu → Flashcard → Ghép câu.\n\nTƯƠNG TÁC: Bấm thẻ để lật, đánh dấu đã nhớ, làm 8 câu để lưu điểm. Vào Trò chơi để trắc nghiệm, gõ chữ Nhật và đặt câu theo buổi đã học. Phần gõ câu được chấm đúng cả Kanji và Hiragana có cùng cách đọc; nhấn Gợi ý để chèn từ nếu chưa biết gõ chữ Hán.\n\nQUIZLET: Bấm “Tải TXT Quizlet” ở phần Flashcard.\n\nTIẾN ĐỘ: Mỗi trình độ N5/N4 có điểm và thẻ riêng. Trên máy khác hãy xuất/nhập sao lưu cùng trình độ.');return;}
if(a==='open-lesson'){state.lessonId=b.dataset.id;state.view='lesson';state.lessonTab='learn';state.cardIndex=0;state.cardFlipped=false;resetPractice();if(!progress.visited.includes(state.lessonId))progress.visited.push(state.lessonId);progress.lastLesson=state.lessonId;save();render();window.scrollTo(0,0);return;}
if(a==='lesson-tab'){if(b.dataset.tab==='games'){state.game=newGameState();state.game.lessonId=state.lessonId;state.view='games';}else{state.view='lesson';state.lessonTab=b.dataset.tab;}render();return;}
if(a==='speak'){speak(b.dataset.text);return;}
if(a==='print'){window.print();return;}
if(a==='export-quizlet'){exportQuizlet();return;}
if(a==='export-group'){exportGroup(b.dataset.id);return;}
if(a==='flip-card'){if(state.view==='review')state.reviewFlip=!state.reviewFlip;else state.cardFlipped=!state.cardFlipped;render();return;}
if(a==='prev-card'||a==='next-card'){const review=state.view==='review';const cards=review?state.reviewQueue:cardList(lesson());if(review){state.reviewIdx=a==='prev-card'?Math.max(0,state.reviewIdx-1):(state.reviewIdx+1)%cards.length;state.reviewFlip=false;}else{state.cardIndex=a==='prev-card'?Math.max(0,state.cardIndex-1):(state.cardIndex+1)%cards.length;state.cardFlipped=false;}render();return;}
if(a==='rate-card'){const review=state.view==='review';const cards=review?state.reviewQueue:cardList(lesson());const i=review?state.reviewIdx:state.cardIndex;const current=cards[i];if(!current)return;noteCard(current.id,b.dataset.rating);if(review){state.reviewQueue.splice(i,1);state.reviewIdx=Math.min(i,Math.max(0,state.reviewQueue.length-1));state.reviewFlip=false;}else{state.cardIndex=(i+1)%cards.length;state.cardFlipped=false;}render();return;}
if(a==='reload-review'){makeReview();render();return;}
if(a==='restart-practice'){resetPractice();render();return;}
if(a==='select-option'){const ex=lesson().exercises[state.practiceIndex];if(state.checked[ex.id])return;state.answers[ex.id]=Number(b.dataset.option);render();return;}
if(a==='add-token'){const ex=lesson().exercises[state.practiceIndex];if(state.checked[ex.id])return;const k=Number(b.dataset.index);if(!state.orderChoices.includes(k))state.orderChoices.push(k);render();return;}
if(a==='undo-token'){state.orderChoices.splice(Number(b.dataset.index),1);render();return;}
if(a==='clear-order'){state.orderChoices=[];render();return;}
if(a==='toggle-hints'){const ex=lesson().exercises[state.practiceIndex];if(state.checked[ex.id])return;state.hintsOpen[ex.id]=!state.hintsOpen[ex.id];render();return;}
if(a==='insert-hint'){const ex=lesson().exercises[state.practiceIndex];if(state.checked[ex.id])return;const field=document.getElementById('practice-input');if(!field)return;const token=b.dataset.text||'';const pos=field.selectionStart??field.value.length;field.value=field.value.slice(0,pos)+token+field.value.slice(pos);field.focus();field.setSelectionRange(pos+token.length,pos+token.length);state.answers[ex.id]=field.value;const check=document.querySelector('[data-action="check-practice"]');if(check)check.disabled=!field.value.trim();return;}
if(a==='check-practice'){const input=document.getElementById('practice-input');if(input){const ex=lesson().exercises[state.practiceIndex];state.answers[ex.id]=input.value;}grade();return;}
if(a==='next-question'){const l=lesson();if(state.practiceIndex<l.exercises.length-1){state.practiceIndex++;state.orderChoices=[];}else{state.practiceIndex=l.exercises.length;finishPractice();}render();return;}
if(a==='library-mode'){state.libraryMode=b.dataset.mode;state.search='';render();return;}
if(a==='group'){state.groupId=b.dataset.id;const el=document.getElementById('library-content');if(el)el.innerHTML=libraryContent();return;}
if(a==='backup'){download(`${level}_Tien_Do_Ca_Nhan.json`,JSON.stringify({format:'nihongo-progress-v5',level,savedAt:new Date().toISOString(),progress},null,2),'application/json');notify('Đã sao lưu tiến độ JSON.');return;}
if(a==='reset-all'){if(confirm('Xóa toàn bộ điểm bài tập và lịch ôn flashcard trên trình duyệt này?')){progress=freshProgress();save();goto('dashboard');}return;}
});
document.addEventListener('input',e=>{if(e.target.id==='library-search'){state.search=e.target.value;const el=document.getElementById('library-content');if(el)el.innerHTML=libraryContent();}if(e.target.id==='game-input'){state.game.input=e.target.value;const btn=document.querySelector('[data-action="game-check"]');if(btn)btn.disabled=!e.target.value.trim();}if(e.target.id==='game-free-input'){state.game.freeInput=e.target.value;state.game.freeResult='';}if(e.target.id==='practice-input'){const ex=lesson().exercises[state.practiceIndex];state.answers[ex.id]=e.target.value;const btn=document.querySelector('[data-action="check-practice"]');if(btn)btn.disabled=e.target.value.trim()==='';}});
document.addEventListener('change',e=>{if(e.target.id==='game-auto-next'){state.game.autoNext=Boolean(e.target.checked);if(state.game.checked){if(state.game.autoNext)scheduleGameAdvance();else cancelGameAdvance();}return;}if(e.target.id==='game-scope'){state.game.scope=e.target.value;state.game.started=false;state.game.finished=false;render();}if(e.target.id==='game-lesson'){state.game.lessonId=e.target.value;state.game.started=false;state.game.finished=false;render();}if(e.target.id==='chapter-select'){state.chapterFilter=Number(e.target.value);state.groupId='';const el=document.getElementById('library-content');if(el)el.innerHTML=libraryContent();}if(e.target.id==='restore-input'){const f=e.target.files?.[0];if(!f)return;f.text().then(t=>{let data=JSON.parse(t);if(data.format!=='nihongo-progress-v5'||data.level!==level||!data.progress||typeof data.progress!=='object')throw Error('invalid');if(!confirm('Thay thế tiến độ hiện tại bằng file sao lưu?'))return;progress=data.progress;save();goto('stats');notify('Đã khôi phục tiến độ từ bản sao.');}).catch(()=>notify('File JSON không đúng định dạng sao lưu.'));}});
document.addEventListener('keydown',e=>{if((state.view==='games'||(state.view==='lesson'&&state.lessonTab==='games'))&&state.game.started&&!state.game.finished&&!e.isComposing){
 if(state.game.checked&&(e.key==='Enter'||e.key===' ')&&!['BUTTON','INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();cancelGameAdvance();nextGameQuestion();render();afterGameRender();return;}
 if(!state.game.checked&&(state.game.questions[state.game.index]?.kind==='quiz'||state.game.questions[state.game.index]?.kind==='picture')&&['1','2','3','4'].includes(e.key)&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();state.game.selected=Number(e.key)-1;gradeGame();render();scheduleGameAdvance();return;}
 }if(e.key==='Enter'&&e.target.id==='game-input'&&!e.isComposing&&!e.shiftKey){e.preventDefault();const b=document.querySelector('[data-action="game-check"]');if(b&&!b.disabled)b.click();}if(e.key==='Enter'&&e.target.id==='practice-input'&&!e.shiftKey){e.preventDefault();const b=document.querySelector('[data-action="check-practice"]');if(b&&!b.disabled)b.click();}});
render();
})();
