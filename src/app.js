import {language} from '../data/language.js';
import {headers} from '../data/tableHeaders.js';
import {data} from '../data/exerciceUITable.js';

const defaultLang = 0;
const languageSelect = document.querySelector('.language-selector');
const groupSelect = document.querySelector('.treeGroup');
const tableHeader = document.querySelector('.ui-table-header-row');
const tableBody = document.querySelector('.ui-table-body');

const totalHeader = headers[0].flatMap(r => r.val).length;
const defaultOrder = 'desc';

/**
 * Convert input to date Text 
 */
const convertDate = (inputText) => {
    var d = new Date(inputText);
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}

/** 
 * Convert input to date Text 
 */
const convertTime = (inputText) => {
    var d = new Date(inputText);
    return [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
}
/**
 * Adds 0 into left for minor 10 numbers
 */
const pad = (s) => (s < 10) ? '0' + s : s;
/**
 * Remove all children nods for a element
 */
const removeChilds = element => {
    if(element.hasChildNodes()) {
        while (element.hasChildNodes()) {  
            element.removeChild(element.firstChild);
        }
    }
}

/**
 * Sort the array by element clicked. Second click reverses order.
 */
const sortFunction = e => {
    //Styling the head clicked
    e.preventDefault();
    let headerClicked = e.target;
    let orderType = headerClicked.getAttribute('orderType');
    Array.from(document.getElementsByClassName('order-header')).forEach(el => {
        el.setAttribute('class', 'order-header');
        el.setAttribute('orderType', '');
        if(el.innerHTML.indexOf('<') >= 0)
            el.innerHTML = el.innerHTML.substring(0,  el.innerHTML.indexOf('<'));
    });
    headerClicked.setAttribute('class', 'order-header active');
    orderType = !orderType ? defaultOrder : orderType == 'desc' ? 'asc' : 'desc';
    headerClicked.setAttribute('orderType', orderType);
    headerClicked.innerHTML = headerClicked.innerHTML + '<i class="arrow fa fa-fw fa-sort-'+orderType+'"></i>';
    loadData(headerClicked.getAttribute('propName'), orderType, groupSelect.selectedOptions[0].value);    
};
/**
 * Reload the UI by the selected language
 */
const reloadLanguage = lang => {
    removeChilds(languageSelect); //refresh inner html
    removeChilds(tableHeader);
    //Fill language options
    languageSelect.innerHTML = language[lang].map((opt) => '<option value="' + opt.value + '" '+(opt.value == lang ? 'selected' : '')+'>'+opt.desc+'</option>').join('');    
    //Fill new language table header
    tableHeader.innerHTML = headers[lang].map((head, idx) => '<th class="order-header" propIdx="'+idx+'" propName="'+head.value+'">' + head.desc + '</th>').join('');
    tableHeader.childNodes.forEach((th) => th.addEventListener('click', sortFunction));
};
/**
 * Load the content table
 */
const loadData = (field, orderType, group) => {
    tableBody.innerHTML = '';
    if(group) { //if group, remove childs         
        let dataGrouped = data.reduce((objectKeyValue, obj) => {
            const val = obj[group];
            objectKeyValue[val] = (objectKeyValue[val] || []).concat(obj);
            return objectKeyValue;
        }, {});
        buildGroupedRows(dataGrouped, field, orderType);
    } else {
        tableBody.innerHTML = 
            data.sort((a, b) => {
                let negate = orderType === 'asc' ? -1 : 1;
                return  a[field] > b[field] ? (1 * negate) : (-1 * negate);
            }).map((row) => {
                let tr =  '<tr>' + buildRow(row) + '</tr>';
                return tr;
            }).join('');
    }
}
//Build the group view of table
const buildGroupedRows = (dataGrouped, field, orderType) => {
    tableBody.innerHTML = Object.getOwnPropertyNames(dataGrouped).map((group) => {
        let grouped = dataGrouped[group].sort((a, b) => {
            let negate = orderType === 'asc' ? -1 : 1;
            return  a[field] > b[field] ? (1 * negate) : (-1 * negate);})
        .map((row) => {
            let tr =  '<tr>' + buildRow(row) + '</tr>';
            return tr;
        }).join('');
        return '<tr><td class="grouper" colspan="'+totalHeader+'">'+group+'</td></tr>'+ grouped;
    }).join('');
};


/**
 * Build the data for a content table row
 */
const buildRow = (rowData) => {

    let text = rowData.note.substring(0, 25) + '...';
    let rowDate = convertDate(rowData.calldate);
    let rowTime = convertTime(rowData.calldate);

    let innerHTML = '<td propname="service">' + rowData.service +'</td>'
    + '<td>' + rowData.destination +'</td>'
    + '<td>' + rowData.source +'</td>'
    + '<td>' + rowDate +'</td>'
    + '<td>' + rowTime +'</td>'
    + '<td>' + rowData.duration +'</td>'
    + '<td>' + rowData.disposition +'</td>'
    + '<td title="'+rowData.note+'">' +text +'</td>'
    + '<td >&nbsp;</td>'
    + '<td>&nbsp;</td>';
    if( rowData.hasrecord) {
        innerHTML += '<td><img src="./resources/check.png" height="24" width="24" class="center-text" /></td>';        
    } else {
        innerHTML += '<td>&nbsp;</td>';
    }
   return innerHTML;
};
//Start page
reloadLanguage(defaultLang);
loadData();
//Add event to language selector
languageSelect.addEventListener('change', e => {
    reloadLanguage(e.target.value);
});
//Add event to grouper selector
groupSelect.addEventListener('change', e => {
    loadData(null, null, e.target.value);
});