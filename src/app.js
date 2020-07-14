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
    e.preventDefault();
    Array.from(document.getElementsByClassName('order-header')).forEach(el => {
        el.setAttribute('class', 'order-header');
        el.setAttribute('orderType', '');
        if(el.innerHTML.indexOf('<') >= 0)
            el.innerHTML = el.innerHTML.substring(0,  el.innerHTML.indexOf('<'));
    });
    let headerClicked = e.target;
    headerClicked.setAttribute('class', 'order-header active');
    let orderType = headerClicked.getAttribute('orderType');
    orderType = !orderType ? defaultOrder : orderType == 'desc' ? 'asc' : 'desc';
    headerClicked.setAttribute('orderType', orderType);
    headerClicked.innerHTML = headerClicked.innerHTML + '<i class="fa fa-fw fa-sort-'+orderType+'"></i>';
    loadData(headerClicked.getAttribute('propName'), orderType, groupSelect.selectedOptions[0].value);
};
/**
 * Reload the UI by the selected language
 */
const reloadLanguage = lang => {
    removeChilds(languageSelect); //refresh inner html
    removeChilds(tableHeader);

    let opts = language[lang];
    opts.forEach((opt) => {
        let option = document.createElement('option');
        option.value = opt.value;
        option.innerHTML = opt.desc;
        if(opt.value == lang)
            option.selected = true;
        languageSelect.appendChild(option);
    });    
    let headerData = headers[lang];
    headerData.forEach((head) => {
        let header = document.createElement('th');
        if(head.value !== '')  {
            header.setAttribute('propName', head.value);
        }
        header.setAttribute('class', 'order-header')
        header.innerHTML = head.desc;
        header.addEventListener('click', sortFunction);
        tableHeader.appendChild(header);
    });
};
/**
 * Load the content table
 */
const loadData = (field, orderType, group) => {
    removeChilds(tableBody);
    
    if(group) {
        let dataGrouped = data.reduce((objectKeyValue, obj) => {
            const val = obj[group];
            objectKeyValue[val] = (objectKeyValue[val] || []).concat(obj);
            return objectKeyValue;
        }, {});
        buildGroupedRows(dataGrouped, field, orderType);
    } else {
        let dataOrdered = data;
         if(field !== undefined)
            dataOrdered = data.sort((a, b) => {
                let negate = orderType === 'asc' ? -1 : 1;
                return  a[field] > b[field] ? (1 * negate) : (-1 * negate);
            });
        dataOrdered.forEach((row) => {
            let tr = document.createElement('tr');
            buildRow(row, tr);
            tableBody.appendChild(tr);
        });
    }
}

const buildGroupedRows = (dataGrouped, field, orderType) => {
    Object.getOwnPropertyNames(dataGrouped).forEach((group) => {
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        th.innerHTML = group;
        th.setAttribute("colspan", totalHeader);
        tr.appendChild(th);
        tableBody.appendChild(tr);
       
        dataGrouped[group].sort((a, b) => {
                let negate = orderType === 'asc' ? -1 : 1;
                return  a[field] > b[field] ? (1 * negate) : (-1 * negate);})
            .forEach(row => {
                let trData = document.createElement('tr');
                buildRow(row, trData);
                tableBody.appendChild(trData);
            });
    })
};


/**
 * Build the data for a content table row
 */
const buildRow = (rowData, tr) => {

    let tdService = document.createElement('td');
    tdService.innerHTML = rowData.service;
    tr.appendChild(tdService);
    let tdDestination = document.createElement('td');
    tdDestination.innerHTML = rowData.destination;
    tr.appendChild(tdDestination);    
    let tdSource = document.createElement('td');
    tdSource.innerHTML = rowData.source;
    tr.appendChild(tdSource);
    let tdDate = document.createElement('td');
    tdDate.innerHTML = convertDate(rowData.calldate);
    tr.appendChild(tdDate);
    let tdHour = document.createElement('td');
    tdHour.innerHTML =  convertTime(rowData.calldate);
    tr.appendChild(tdHour);
    let tdDuration = document.createElement('td');
    tdDuration.innerHTML = rowData.duration;
    tr.appendChild(tdDuration);
    let tdDisposition = document.createElement('td');
    tdDisposition.innerHTML = rowData.disposition;
    tr.appendChild(tdDisposition);
    let tdText = document.createElement('td');
    let text = rowData.note.substring(0, 25) + '...';
    tdText.innerHTML = text;
    tdText.setAttribute('title', rowData.note);
    tr.appendChild(tdText);
    let td= document.createElement('td');
    tr.appendChild(td);
    td= document.createElement('td');
    tr.appendChild(td);
    let hasRecord = rowData.hasrecord;
    if(hasRecord) {
        let tdImg= document.createElement('td');
        let img = document.createElement('img');
        img.src = '/resources/check.png';
        img.innerHtml = hasRecord;
        img.setAttribute('height', '24');
        img.setAttribute('width', '24');
        tdImg.setAttribute('class', 'center-text');
        tdImg.appendChild(img);
        tr.appendChild(tdImg);
    } else {
        td= document.createElement('td');
        tr.appendChild(td);
    }
};
//Start page
reloadLanguage(defaultLang);
loadData();
//Add event to language selector
languageSelect.addEventListener('change', e => {
    reloadLanguage(e.target.value);
});

groupSelect.addEventListener('change', e => {
    loadData(null, null, e.target.value);
});