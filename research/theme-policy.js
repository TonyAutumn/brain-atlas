// Conservative guard for automatic suggestions; manual records are not rewritten.
export function automaticThemes(values){
 const excluded=/(?:神经科学|心理学|生物学|医学|科学研究)$|\b(?:neuroscience|psychology|biology)\b|^(?:进化|认知|神经机制|脑机制|神经回路|脑网络|功能连接|有效连接|预测编码|预测加工|自由能原理|全局工作空间理论|整合信息理论|脑电|脑成像|功能磁共振|磁共振成像|经颅磁刺激|光遗传学|海马|岛叶|杏仁核|丘脑|前额叶|fMRI|EEG|MEG|TMS|PET)$/i;
 return [...new Set((Array.isArray(values)?values:[]).filter(v=>typeof v==='string').map(v=>v.trim()).filter(v=>v&&!excluded.test(v)))].slice(0,3);
}
