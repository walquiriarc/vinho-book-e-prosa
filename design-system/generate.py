"""Gera os exports da marca. Ferramenta opcional; o app não tem etapa de build."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
DS=ROOT/'design-system'
S=json.loads((ROOT/'design-system/system.json').read_text())
PUBLIC=ROOT/'docs/marca'
def rgb(h):return [int(h[i:i+2],16) for i in (1,3,5)]
def token(t,v):return {'$type':t,'$value':v}
def color(h):return {'colorSpace':'srgb','components':[v/255 for v in rgb(h)],'alpha':1,'hex':h}
def dim(v):return {'value':v,'unit':'rem'}
modes={}
lines=['/* Gerado de design-system/system.json. Valores literais somente no :root. */',':root {']
for palette,t in S['themes'].items():
 for appearance in ['light','dark']:
  colors={**S['sharedColors' if appearance=='light' else 'darkSharedColors'],**t['colors' if appearance=='light' else 'darkColors']}
  modes[palette+'-'+appearance]=colors
  for k,v in colors.items():lines.append(f'  --vbp-{palette}-{appearance}-{k}: {v};')
lines += ['  --vbp-overlay: rgb(33 29 26 / .62);','  --vbp-sombra-modal: 0 16px 48px rgb(33 29 26 / .16);','  --vbp-sombra-capa: 0 2px 8px rgb(33 29 26 / .12);', '  --vbp-font-display: "VBP Cormorant", Georgia, serif;','  --vbp-font-body: "VBP Lato", Arial, sans-serif;','  --vbp-radius-control: .25rem;','  --vbp-radius-card: .25rem;','  --vbp-motion: 120ms;','  --vbp-control-min: 2.75rem;']
for k,v in S['spacing'].items():lines.append(f'  --vbp-space-{k}: {v:g}rem;')
for k,v in S['typography'].items():
 lines += [f'  --vbp-type-{k}-size: {v["size"]:g}rem;',f'  --vbp-type-{k}-line: {v["lineHeight"]};',f'  --vbp-type-{k}-weight: {v["weight"]};',f'  --vbp-type-{k}-tracking: {v["tracking"]}em;']
def aliases(p,a):return ['  --vbp-'+k+': var(--vbp-'+p+'-'+a+'-'+k+');' for k in modes[p+'-'+a]]
lines += aliases('vinho','light')+['}']
lines += [':root[data-paleta="oliva"] {']+aliases('oliva','light')+['}']
lines += ['@media (prefers-color-scheme: dark) {',':root:not([data-theme="light"]) {']+aliases('vinho','dark')+['}',':root[data-paleta="oliva"]:not([data-theme="light"]) {']+aliases('oliva','dark')+['}','}']
lines += [':root[data-theme="dark"] {']+aliases('vinho','dark')+['}',':root[data-theme="dark"][data-paleta="oliva"] {']+aliases('oliva','dark')+['}']
(PUBLIC/'tokens.css').write_text('\n'.join(lines)+'\n')
(DS/'resolved.json').write_text(json.dumps({'name':S['name'],'version':S['version'],'modes':modes,'typography':S['typography'],'spacing':S['spacing'],'radii':S['radii'],'layout':S['layout']},ensure_ascii=False,indent=2)+'\n')
td=DS/'tokens';td.mkdir(exist_ok=True)
for mode,c in modes.items():
 data={'$description':'VBP '+mode+'; todas as expressões têm o mesmo peso.','color':{k:token('color',color(v)) for k,v in c.items()},'font':{k:token('fontFamily',v) for k,v in S['fontFamilies'].items()},'space':{k:token('dimension',dim(v)) for k,v in S['spacing'].items()},'radius':{k:token('dimension',dim(v)) for k,v in S['radii'].items()},'typography':{},'motion':{'standard':token('duration',{'value':S['motion']['standardMs'],'unit':'ms'})},'component':{}}
 for k,v in S['typography'].items():data['typography'][k]=token('typography',{'fontFamily':'{font.'+v['family']+'}','fontSize':dim(v['size']),'fontWeight':v['weight'],'letterSpacing':dim(v['tracking']*v['size']),'lineHeight':v['lineHeight']})
 data['component']['button']={'background':token('color','{color.primary}'),'text':token('color','{color.on-primary}'),'radius':token('dimension','{radius.control}')}
 data['component']['card']={'background':token('color','{color.surface}'),'text':token('color','{color.text}'),'radius':token('dimension','{radius.card}'),'padding':token('dimension','{space.6}')}
 (td/(mode+'.tokens.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Quatro modos exportados. O aplicativo continua sem build e sem dependências novas.')
