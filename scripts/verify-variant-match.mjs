import { matchVariant, colorOptions } from '../convex/variantMatch.ts';
const tee = [
  {id:1,size:'S',color:'French Navy',variant_id:11},
  {id:2,size:'S',color:'Black',variant_id:12},
  {id:3,size:'XL',color:'Navy / White',variant_id:13},
  {id:4,size:'XL',color:'Black / White',variant_id:14},
];
const jersey = [{id:9,size:'XL',color:null,variant_id:99},{id:10,size:'2XS',color:null,variant_id:98}];
const t=[];
const eq=(n,a,b)=>t.push([n, JSON.stringify(a)===JSON.stringify(b), a]);
eq('tee picks chosen colour', matchVariant(tee,'S','Black')?.id, 2);
eq('tee slash colour disambiguated', matchVariant(tee,'XL','Navy / White')?.id, 3);
eq('tee other slash colour', matchVariant(tee,'XL','Black / White')?.id, 4);
eq('tee refuses to guess colour', matchVariant(tee,'S'), null);
eq('tee unknown colour -> null', matchVariant(tee,'S','Purple'), null);
eq('single-colour product ignores colour', matchVariant(jersey,'XL')?.id, 9);
eq('legacy "Name / Size" cart string', matchVariant(jersey,'J-Glitch Jersey [Black] / XL')?.id, 9);
eq('case/space insensitive', matchVariant(tee,' s ','black')?.id, 2);
eq('unknown size -> null', matchVariant(jersey,'4XL'), null);
eq('empty variants -> null', matchVariant([],'XL'), null);
eq('colourOptions dedupes', colorOptions(tee).length, 4);
eq('colourOptions empty for jersey', colorOptions(jersey).length, 0);
let fail=0;
for (const [n,ok,got] of t){ if(!ok){fail++; console.log('FAIL',n,'got',got);} else console.log('pass',n); }
console.log(fail? `${fail} FAILED` : 'all passed');
process.exit(fail?1:0);
