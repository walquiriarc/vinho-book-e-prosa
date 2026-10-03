"""Valida os quatro temas e os arquivos servidos pelo app; somente Python padrão."""
from pathlib import Path
import json, re, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
DS=ROOT/'design-system'
R=json.loads((DS/'resolved.json').read_text())
def luminance(h):
 a=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 a=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in a]
 return sum(v*w for v,w in zip(a,[.2126,.7152,.0722]))
def contrast(a,b):
 low,high=sorted([luminance(a),luminance(b)])
 return (high+.05)/(low+.05)
pairs=[('body','text','surface',4.5),('body-page','text','background',4.5),('muted','text-muted','background',4.5),('muted-card','text-muted','surface',4.5),('button','on-primary','primary',4.5),('button-hover','on-primary','primary-hover',4.5),('button-active','on-primary','primary-active',4.5),('badge','primary','primary-soft',4.5),('disabled','disabled-text','disabled-background',4.5),('field-border','control-border','surface',3),('field-border-page','control-border','background',3),('focus','focus','background',3)]
for status in ['success','warning','error','info']:pairs.append(('state-'+status,status,status+'-background',4.5))
pairs.append(('error-toast','on-primary','error',4.5))
checks=[];errors=[]
for mode,c in R['modes'].items():
 for name,fg,bg,minimum in pairs:
  ratio=contrast(c[fg],c[bg]);checks.append({'mode':mode,'pair':name,'foreground':c[fg],'background':c[bg],'ratio':round(ratio,3),'minimum':minimum,'pass':ratio>=minimum})
  if ratio<minimum:errors.append(mode+': '+name)
for p in (DS/'tokens').glob('*.json'):
 data=json.loads(p.read_text())
 def check(obj):
  if isinstance(obj,dict):
   for k,v in obj.items():check(v)
  elif isinstance(obj,list):
   for v in obj:check(v)
  elif isinstance(obj,str) and re.fullmatch(r'\{[^{}]+\}',obj):
   target=data
   try:
    for key in obj[1:-1].split('.'):target=target[key]
    assert '$value' in target
   except (KeyError,TypeError,AssertionError):errors.append(p.name+' broken '+obj)
 check(data)
for p in (ROOT/'docs/marca/logos').glob('*.svg'):ET.fromstring(p.read_text())
for p in (ROOT/'docs/marca/logos').glob('*_vinho.svg'):
 other=p.with_name(p.name.replace('_vinho.svg','_oliva.svg'))
 assert re.sub(r'#[\da-fA-F]{6}','#COR',p.read_text())==re.sub(r'#[\da-fA-F]{6}','#COR',other.read_text()),p.name
sw=(ROOT/'docs/sw.js').read_text()
for relative in re.findall(r'"(\./[^"]+)"',sw):
 if relative=='./':continue
 if not (ROOT/'docs'/relative[2:]).is_file():errors.append('cache missing '+relative)
for p in [ROOT/'docs/manifest.webmanifest',*(ROOT/'docs/marca').glob('*.webmanifest')]:
 manifest=json.loads(p.read_text())
 for icon in manifest['icons']:
  if not (p.parent/icon['src']).is_file():errors.append('icon missing '+icon['src'])
css=(ROOT/'docs/styles.css').read_text()
if re.search(r'#[\da-fA-F]{3,8}\b|rgba?\(',css):errors.append('color literal outside token file')
report={'status':'pass' if not errors else 'fail','modes':list(R['modes']),'contrastCheckCount':len(checks),'checks':checks,'errors':errors,'scope':'Contraste dos pares definidos, referências DTCG, identidade dos contornos SVG, assets locais e casca PWA. Não é auditoria integral WCAG.'}
(DS/'validation').mkdir(exist_ok=True)
(DS/'validation/tokens.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'contrastCheckCount':len(checks),'errors':errors},ensure_ascii=False))
raise SystemExit(bool(errors))
