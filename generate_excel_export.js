const fs = require('fs');

let code = fs.readFileSync('js/products.js', 'utf8');
let products = new Function('const window = {}; ' + code + '; return products;')();

let lines = ['Product Name\tBrand / Inspired By\tCollection\tGender\t20ml (INR)\t50ml (INR)\t100ml (INR)\tAttar (3ml / 6ml / 12ml)\tSolid & Other Sizes\tFragrance Notes\tBadge / Celebrity'];

for (const p of products) {
    let p20 = (p.sizes && p.sizes['20ml'] !== undefined) ? '₹' + p.sizes['20ml'] : '-';
    let p50 = (p.sizes && p.sizes['50ml'] !== undefined) ? '₹' + p.sizes['50ml'] : '-';
    let p100 = (p.sizes && p.sizes['100ml'] !== undefined) ? '₹' + p.sizes['100ml'] : '-';
    
    let attarList = [];
    if (p.sizes && p.sizes['3ml'] !== undefined) attarList.push('3ml: ₹' + p.sizes['3ml']);
    if (p.sizes && p.sizes['6ml'] !== undefined) attarList.push('6ml: ₹' + p.sizes['6ml']);
    if (p.sizes && p.sizes['12ml'] !== undefined) attarList.push('12ml: ₹' + p.sizes['12ml']);
    let attarStr = attarList.length > 0 ? attarList.join(' | ') : '-';

    let otherList = [];
    for (const [k, v] of Object.entries(p.sizes || {})) {
        if (!['20ml', '50ml', '100ml', '3ml', '6ml', '12ml'].includes(k)) {
            otherList.push(`${k}: ₹${v}`);
        }
    }
    let otherStr = otherList.length > 0 ? otherList.join(' | ') : '-';

    let notesStr = (p.notes || []).join(', ');
    let badgeStr = p.badge || (p.celebrity ? 'Celebrity: ' + p.celebrity : '-');

    lines.push([
        p.name || '',
        p.brand || '',
        p.collection || '',
        p.gender || '',
        p20,
        p50,
        p100,
        attarStr,
        otherStr,
        notesStr,
        badgeStr
    ].join('\t'));
}

fs.writeFileSync('Arabian_Perfume_Lab_Products.tsv', lines.join('\n'), 'utf8');
console.log('Saved Arabian_Perfume_Lab_Products.tsv successfully with', products.length, 'products');

// Also create CSV format
let csvLines = ['"Product Name","Brand / Inspired By","Collection","Gender","20ml (INR)","50ml (INR)","100ml (INR)","Attar (3ml / 6ml / 12ml)","Solid & Other Sizes","Fragrance Notes","Badge / Celebrity"'];

for (const p of products) {
    let p20 = (p.sizes && p.sizes['20ml'] !== undefined) ? '₹' + p.sizes['20ml'] : '-';
    let p50 = (p.sizes && p.sizes['50ml'] !== undefined) ? '₹' + p.sizes['50ml'] : '-';
    let p100 = (p.sizes && p.sizes['100ml'] !== undefined) ? '₹' + p.sizes['100ml'] : '-';
    
    let attarList = [];
    if (p.sizes && p.sizes['3ml'] !== undefined) attarList.push('3ml: ₹' + p.sizes['3ml']);
    if (p.sizes && p.sizes['6ml'] !== undefined) attarList.push('6ml: ₹' + p.sizes['6ml']);
    if (p.sizes && p.sizes['12ml'] !== undefined) attarList.push('12ml: ₹' + p.sizes['12ml']);
    let attarStr = attarList.length > 0 ? attarList.join(' | ') : '-';

    let otherList = [];
    for (const [k, v] of Object.entries(p.sizes || {})) {
        if (!['20ml', '50ml', '100ml', '3ml', '6ml', '12ml'].includes(k)) {
            otherList.push(`${k}: ₹${v}`);
        }
    }
    let otherStr = otherList.length > 0 ? otherList.join(' | ') : '-';

    let notesStr = (p.notes || []).join(', ');
    let badgeStr = p.badge || (p.celebrity ? 'Celebrity: ' + p.celebrity : '-');

    csvLines.push([
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        `"${(p.collection || '').replace(/"/g, '""')}"`,
        `"${(p.gender || '').replace(/"/g, '""')}"`,
        `"${p20}"`,
        `"${p50}"`,
        `"${p100}"`,
        `"${attarStr}"`,
        `"${otherStr}"`,
        `"${notesStr.replace(/"/g, '""')}"`,
        `"${badgeStr.replace(/"/g, '""')}"`
    ].join(','));
}

fs.writeFileSync('Arabian_Perfume_Lab_Products.csv', csvLines.join('\n'), 'utf8');
console.log('Saved Arabian_Perfume_Lab_Products.csv successfully');
