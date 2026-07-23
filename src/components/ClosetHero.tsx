import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const WOMEN = [
  ["D-Slip Black", "/overlays/d-slip-dress-black.png"],
  ["D-Slip Nude", "/overlays/d-slip-dress-nude.png"],
  ["D-Slip Red", "/overlays/d-slip-dress-red.png"],
  ["B-Lift Onyx", "/overlays/b-lift-sports-bra-onyx.png"],
  ["L-Flow Ivory", "/overlays/l-flow-leggings-ivory.png"],
] as const;
const MEN = [
  ["J-Glitch Black", "/overlays/j-glitch-jersey-black.png"],
  ["J-Glitch Volt", "/overlays/j-glitch-jersey-volt.png"],
  ["S-Glitch Ice", "/overlays/s-glitch-25-shorts-ice.png"],
  ["T-Icon Navy", "/overlays/t-icon-oversized-tee-french-navy.png"],
  ["T-Icon Milky Way", "/overlays/t-icon-tie-dye-tee-milky-way.png"],
] as const;

type Weather = "clear" | "overcast" | "rain" | "storm" | "sunset" | "night";
function phaseForNow(): Weather {
  const h = new Date().getHours();
  if (h < 6 || h >= 20) return "night";
  if (h >= 17) return "sunset";
  return "clear";
}

export function ClosetHero() {
  const [weather, setWeather] = useState<Weather>(phaseForNow());
  const [active, setActive] = useState<(typeof WOMEN)[number] | (typeof MEN)[number] | null>(null);
  const [locationLabel, setLocationLabel] = useState("Local sky");
  const [tryOn, setTryOn] = useState(false);
  const skyLabel = useMemo(() => ({ clear: "Clear", overcast: "Overcast", rain: "Rain", storm: "Storm", sunset: "Sunset", night: "Night" }[weather]), [weather]);

  useEffect(() => {
    const timer = window.setInterval(() => setWeather((current) => current === "clear" ? phaseForNow() : current), 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  function requestLocalSky() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setLocationLabel("Live local sky"),
      () => setLocationLabel("Local time sky"),
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }

  return (
    <section className={`finished-store weather-${weather}`} aria-label="XI XVI interactive showroom">
      <style>{`
        .finished-store{--pink:#ff2faf;--blue:#2788ff;--gold:#e7c16f;position:relative;min-height:clamp(680px,calc(100svh - 110px),940px);overflow:hidden;background:#ecedf0;color:#fff;isolation:isolate}
        .showroom-base{position:absolute;inset:0;background:url('/showroom-finished-base.jpg') center/cover no-repeat;z-index:-5;filter:saturate(.92) brightness(.98)}
        .showroom-base:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(246,46,167,.12),transparent 36%,transparent 64%,rgba(39,136,255,.13)),linear-gradient(180deg,rgba(0,8,28,.18),transparent 34%,rgba(255,255,255,.02));mix-blend-mode:screen}
        .dynamic-sky{position:absolute;z-index:-3;top:0;left:27%;right:27%;height:27%;clip-path:polygon(8% 0,92% 0,100% 100%,0 100%);background:#06183b;overflow:hidden;transition:background 1s ease,filter 1s ease}
        .dynamic-sky:before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(183,222,255,.92) 1px,transparent 1.4px),radial-gradient(ellipse at 33% 55%,rgba(202,231,255,.68),transparent 30%),radial-gradient(ellipse at 70% 38%,rgba(118,183,255,.54),transparent 28%);background-size:6px 6px,100% 100%,100% 100%;animation:sky-drift 18s linear infinite}
        .weather-overcast .dynamic-sky{background:#233858;filter:saturate(.55)}.weather-rain .dynamic-sky{background:#152944}.weather-rain .dynamic-sky:after{content:"";position:absolute;inset:-20%;background:repeating-linear-gradient(105deg,transparent 0 12px,rgba(196,225,255,.28) 13px 14px);animation:rain 1.4s linear infinite}.weather-storm .dynamic-sky{background:#070b20;animation:flash 8s infinite}.weather-sunset .dynamic-sky{background:linear-gradient(#141d53,#9d3b70,#ff966f)}.weather-night .dynamic-sky{background:#010617}.weather-night .dynamic-sky:before{background-image:radial-gradient(circle,rgba(231,244,255,.98) 1px,transparent 1.5px);background-size:8px 8px}
        @keyframes sky-drift{to{background-position:30px 0,35px 0,-28px 0}}@keyframes rain{to{transform:translate(24px,50px)}}@keyframes flash{0%,92%,96%,100%{filter:brightness(1)}94%{filter:brightness(2.1)}}
        .store-topbar{position:absolute;top:18px;left:50%;transform:translateX(-50%);z-index:20;display:flex;align-items:center;gap:10px;padding:8px 10px 8px 15px;border:1px solid rgba(255,255,255,.55);background:rgba(4,12,28,.55);backdrop-filter:blur(18px);border-radius:999px;box-shadow:0 8px 30px rgba(0,15,40,.22)}
        .store-topbar span{font-size:9px;letter-spacing:.17em;text-transform:uppercase;white-space:nowrap}.weather-select{appearance:none;border:0;color:white;background:rgba(255,255,255,.1);font:600 9px/1.2 system-ui;letter-spacing:.12em;text-transform:uppercase;border-radius:999px;padding:8px 28px 8px 11px;cursor:pointer}.weather-select option{background:#071328}.locate{border:0;background:none;color:#b9dbff;font-size:9px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
        .brand-relief{position:absolute;top:28%;left:50%;transform:translate(-50%,-50%);width:clamp(58px,7vw,104px);z-index:4;filter:drop-shadow(0 2px 5px rgba(64,43,8,.35));opacity:.96}.brand-relief img{width:100%;height:auto;display:block;mix-blend-mode:multiply;clip-path:inset(2% 2% 2% 2%)}
        .brand-relief:after{content:"MOVE WITH INTENTION";position:absolute;top:106%;left:50%;transform:translateX(-50%);font:600 clamp(7px,.66vw,11px)/1.2 system-ui;letter-spacing:.22em;color:#b99549;white-space:nowrap;text-shadow:0 1px white}
        .zone-mark{position:absolute;top:34%;z-index:6;font:600 clamp(7px,.72vw,11px)/1.2 system-ui;letter-spacing:.23em;color:rgba(255,255,255,.72);text-transform:uppercase;mix-blend-mode:screen}.zone-mark.women{left:7%;text-shadow:0 0 12px var(--pink)}.zone-mark.men{right:7%;text-shadow:0 0 12px var(--blue)}
        .closet{position:absolute;z-index:4;top:29%;width:23%;height:34%;display:grid;grid-template-columns:repeat(5,1fr);gap:2%;align-items:end;padding:2.5%;border:1px solid rgba(255,255,255,.16);background:linear-gradient(180deg,rgba(4,8,18,.2),rgba(2,4,10,.56));backdrop-filter:blur(1px);perspective:600px}.closet.women{left:2.4%;box-shadow:inset 0 0 30px rgba(255,47,175,.18),0 0 25px rgba(255,47,175,.09)}.closet.men{right:2.4%;box-shadow:inset 0 0 30px rgba(39,136,255,.18),0 0 25px rgba(39,136,255,.09)}
        .holo-product{border:0;background:none;padding:0;height:100%;cursor:pointer;position:relative;filter:drop-shadow(0 0 8px currentColor);transition:opacity .25s,transform .25s}.holo-product img{width:100%;height:100%;object-fit:contain;object-position:center bottom;opacity:.76;mix-blend-mode:screen}.holo-product:hover,.holo-product:focus-visible{transform:translateY(-8px) scale(1.06);outline:none}.holo-product:after{content:"";position:absolute;left:10%;right:10%;bottom:-3px;height:2px;background:currentColor;box-shadow:0 0 9px currentColor}.women .holo-product{color:var(--pink)}.men .holo-product{color:var(--blue)}
        .mannequin-stage{position:absolute;z-index:8;bottom:5.5%;width:clamp(190px,20vw,310px);height:68%;display:flex;align-items:flex-end;justify-content:center;pointer-events:none}.mannequin-stage.women{left:27.3%;transform:translateX(-50%)}.mannequin-stage.men{left:72.7%;transform:translateX(-50%)}.mannequin-stage img{max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 14px 14px rgba(0,0,0,.24)) drop-shadow(0 0 18px rgba(255,255,255,.16))}.mannequin-stage:after{content:"";position:absolute;bottom:0;width:61%;height:5%;border-radius:50%;background:rgba(236,238,241,.68);border:1px solid rgba(255,255,255,.85);box-shadow:0 6px 15px rgba(40,50,75,.18),inset 0 2px 4px white}.mannequin-stage img{position:relative;z-index:2;margin-bottom:1.2%}
        .equipment-case{position:absolute;z-index:7;bottom:9%;width:9.5%;height:22%;border:1px solid rgba(255,255,255,.58);background:linear-gradient(145deg,rgba(255,255,255,.24),rgba(255,255,255,.03));backdrop-filter:blur(5px);display:flex;align-items:flex-end;justify-content:center;gap:6%;padding-bottom:12px}.equipment-case.women{left:38%;box-shadow:0 0 18px rgba(255,47,175,.15)}.equipment-case.men{right:38%;box-shadow:0 0 18px rgba(39,136,255,.15)}.weight{display:block;border:4px solid rgba(135,202,255,.72);border-radius:5px;width:21%;height:15%;box-shadow:0 0 10px rgba(73,160,255,.55)}.weight:nth-child(2){height:28%;border-radius:50%}.weight:nth-child(3){height:20%;transform:rotate(40deg)}
        .threshold-copy{position:absolute;bottom:1.8%;left:50%;transform:translateX(-50%);z-index:12;color:rgba(45,54,69,.7);font:600 clamp(7px,.65vw,10px)/1.2 system-ui;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap}
        .cta{position:absolute;z-index:14;bottom:4.5%;padding:10px 18px;border:1px solid rgba(255,255,255,.75);background:rgba(255,255,255,.66);backdrop-filter:blur(16px);color:#172038;text-decoration:none;font:700 9px/1 system-ui;letter-spacing:.18em;text-transform:uppercase;box-shadow:0 7px 24px rgba(35,45,75,.13)}.cta.women{left:3.3%}.cta.men{right:3.3%}.cta:hover{background:white;transform:translateY(-2px)}
        .product-glass{position:absolute;z-index:30;inset:12% 25% 9%;display:grid;grid-template-columns:1fr 1.1fr;background:rgba(242,246,250,.86);color:#11182a;border:1px solid white;backdrop-filter:blur(26px);box-shadow:0 30px 90px rgba(3,15,40,.34)}.product-visual{display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(65,147,255,.12),transparent 60%)}.product-visual img{max-width:78%;max-height:78%;object-fit:contain;filter:drop-shadow(0 14px 20px rgba(15,30,60,.2))}.product-details{padding:clamp(24px,4vw,64px);display:flex;flex-direction:column;justify-content:center}.product-details .eyebrow{font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#69758b}.product-details h2{font:500 clamp(26px,3vw,52px)/1.02 Georgia,serif;margin:14px 0 18px}.product-details p{max-width:430px;color:#4e5a70;font-size:13px;line-height:1.7}.detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#ccd3dd;margin:26px 0}.detail-grid div{background:rgba(255,255,255,.8);padding:12px}.detail-grid b,.detail-grid span{display:block}.detail-grid b{font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:#8290a3}.detail-grid span{font-size:11px;margin-top:5px}.glass-actions{display:flex;gap:10px}.glass-actions button,.glass-actions a{border:1px solid #172038;padding:12px 16px;text-transform:uppercase;letter-spacing:.14em;font:700 9px system-ui;text-decoration:none;color:#172038;background:transparent;cursor:pointer}.glass-actions .primary{background:#172038;color:white}.close-glass{position:absolute;right:16px;top:12px;border:0;background:none;font-size:24px;color:#172038;cursor:pointer}.tryon-note{margin-top:18px;padding:12px;border-left:2px solid var(--blue);background:rgba(39,136,255,.08);font-size:11px;color:#31435d}
        @media(max-width:800px){.finished-store{min-height:760px}.showroom-base{background-position:center}.dynamic-sky{left:9%;right:9%;height:21%}.store-topbar{top:10px;max-width:94%;gap:5px}.store-topbar span{display:none}.locate{display:none}.brand-relief{top:24%;width:58px}.brand-relief:after{font-size:6px}.zone-mark{top:31%;font-size:6px}.closet{top:29%;height:22%;width:29%;padding:2%;grid-template-columns:repeat(3,1fr)}.closet .holo-product:nth-child(n+4){display:none}.closet.women{left:1%}.closet.men{right:1%}.mannequin-stage{bottom:10%;height:56%;width:46vw}.mannequin-stage.women{left:29%}.mannequin-stage.men{left:71%}.equipment-case{display:none}.cta{bottom:3%;padding:9px 12px;font-size:8px}.threshold-copy{bottom:7%;font-size:6px}.product-glass{inset:8% 4% 6%;grid-template-columns:1fr;grid-template-rows:42% 58%}.product-details{padding:20px}.product-details h2{font-size:28px;margin:8px 0}.product-details p{font-size:11px}.detail-grid{margin:12px 0}.glass-actions{flex-wrap:wrap}}
        @media(prefers-reduced-motion:reduce){.dynamic-sky:before,.weather-rain .dynamic-sky:after,.weather-storm .dynamic-sky{animation:none}}
      `}</style>

      <div className="showroom-base" />
      <div className="dynamic-sky" aria-hidden="true" />
      <div className="store-topbar">
        <span>{locationLabel} · {skyLabel}</span>
        <select className="weather-select" value={weather} onChange={(e) => setWeather(e.target.value as Weather)} aria-label="Showroom sky conditions">
          <option value="clear">Clear</option><option value="overcast">Overcast</option><option value="rain">Rain</option><option value="storm">Storm</option><option value="sunset">Sunset</option><option value="night">Night</option>
        </select>
        <button className="locate" type="button" onClick={requestLocalSky}>Use my location</button>
      </div>

      <div className="brand-relief"><img src="/master-logo.jpg" alt="XI XVI — Eleven Sixteen" /></div>
      <div className="zone-mark women">11 // Illumination</div><div className="zone-mark men">16 // Reinvention</div>

      <div className="closet women" aria-label="Women's holographic closet">
        {WOMEN.map((item) => <button key={item[0]} className="holo-product" onClick={() => { setActive(item); setTryOn(false); }} aria-label={`View ${item[0]}`}><img src={item[1]} alt="" /></button>)}
      </div>
      <div className="closet men" aria-label="Men's holographic closet">
        {MEN.map((item) => <button key={item[0]} className="holo-product" onClick={() => { setActive(item); setTryOn(false); }} aria-label={`View ${item[0]}`}><img src={item[1]} alt="" /></button>)}
      </div>

      <div className="mannequin-stage women"><img src="/mannequin-women-v37.png" alt="Women's XI XVI SkyMannequin" /></div>
      <div className="mannequin-stage men"><img src="/mannequin-men-v31.png" alt="Men's XI XVI SkyMannequin" /></div>
      <div className="equipment-case women" aria-label="Dynamic Sky weights"><i className="weight" /><i className="weight" /><i className="weight" /></div>
      <div className="equipment-case men" aria-label="Dynamic Sky weights"><i className="weight" /><i className="weight" /><i className="weight" /></div>

      <Link to="/shop?gender=women" className="cta women">Enter Women’s</Link><Link to="/shop?gender=men" className="cta men">Enter Men’s</Link>
      <div className="threshold-copy">11 + 16 = 9 · 0 unsold inventory · 100% on demand</div>

      {active && <div className="product-glass" role="dialog" aria-modal="true" aria-label={`${active[0]} product display`}>
        <button className="close-glass" onClick={() => setActive(null)} aria-label="Close">×</button>
        <div className="product-visual"><img src={active[1]} alt={active[0]} /></div>
        <div className="product-details">
          <span className="eyebrow">Crafted when chosen · XI · XVI</span>
          <h2>{active[0]}</h2>
          <p>Made on demand for exacting movement, individual expression, and zero unsold inventory. Select your fit and color; production begins only after you choose it.</p>
          <div className="detail-grid"><div><b>Production</b><span>Made to order</span></div><div><b>Inventory</b><span>0 unsold</span></div><div><b>Experience</b><span>Virtual fit</span></div></div>
          <div className="glass-actions"><button className="primary" onClick={() => setTryOn(true)}>Virtual try-on</button><Link to="/shop">View product</Link></div>
          {tryOn && <div className="tryon-note">Virtual try-on bay activated. Your selected piece remains isolated while the rest of the closet dims.</div>}
        </div>
      </div>}
    </section>
  );
}
