const express = require('express');
const cors = require("cors");
const axios = require('axios');
const {v4 : uuidv4} = require('uuid');
const { json, application } = require('express');
const md5 = require('js-md5');
const app = express();

const corsOptions = {
    origin: "*",
};

const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  
app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb', extended: true}));
app.use(cors(corsOptions));
const date = new Date();

const url = "http://r.applovin.com/";
const endPoint={
    maxReport: "maxReport",
    report: "report"
}
const fourteendays=1209600000;// 14 days in millisecond
const hourToMs = (time) => time*36*1e5;
const dayToMs = (day) => day*864*1e5;

async function dateList(range, networkURL){

    const params={
        api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
        format: "json",
        end: range.end,
        start: range.start,
        sort_day: "ASC",
        columns: "day",
        report_type: "advertiser"
    }
    const dates = await axios.get(networkURL, {params}).catch(err=>{console.log(err);});
    return new Promise((res, rej)=>{
        res(dates.data.results);
    })
}

function compare(fdata, sdata, params){
    
    function binarySearch(arr, val, compare) {
        var m = 0;
        var n = arr.length - 1;
        while (m <= n) {
            var k = (n + m) >> 1;
            var cmp = compare(val, arr[k]);
            if (cmp > 0) {
                m = k + 1;
            } else if(cmp < 0) {
                n = k - 1;
            } else {
                return k;
            }
        }
        return -m - 1;
    }

    return new Promise((res, rej)=>{
        let ans = [];

        for (let i = 0; i < fdata.length; ++i) {
            let dif = 0.0;
            const j = binarySearch(sdata, fdata[i], (a, b)=>{
                if(a.key>b.key) return 1;
                if(a.key < b.key) return -1
                return 0;
            })
            if(j>=0) {
                dif = parseFloat(fdata[i].estimated_revenue) - parseFloat(sdata[j].estimated_revenue);
                let mn = Math.min(parseFloat(fdata[i].estimated_revenue), parseFloat(sdata[j].estimated_revenue));
                if (mn)
                    dif = ((dif) / mn) * 100;
                if (Math.abs(dif) >= params.min_dif && fdata[i].estimated_revenue >=params.min_rev) {
                    ans.push(fdata[i]);
                    ans[ans.length - 1].dif = parseInt(dif);
                    ans[ans.length - 1].estimated_revenue = parseFloat(ans[ans.length - 1].estimated_revenue.slice(0, 7));
                    ans[ans.length - 1].estimated_revenue_2 = parseFloat(sdata[j].estimated_revenue.slice(0, 7));
                }
            }
        }
        res(ans);
    })
}

// function compress(arr){

//     return new Promise((res, rej)=>{
//         let brr=[];
//         brr.push(arr[0]);
//         for (let i = 1; i < arr.length; ++i) {
//             if (arr[i].key === arr[i - 1].key) {
//                 brr[brr.length-1].estimated_revenue = parseFloat(brr[brr.length-1].estimated_revenue) + parseFloat(arr[i].estimated_revenue);
//             }
//             else {    
//                 brr.push(arr[i]);
//             }
//         }
//         arr = [...brr];
//         res();
//     })
// }
const id_success=[];
const id_ans=[];
async function fetcher(source_params, token){

    console.log(`Fetching from ${url}...`);
    let fetchStart = Date.now();

    const fdata=[];
    const sdata=[];
    let keymap=[];
    let keyno=0;
    const dif=source_params.end-source_params.start;

    const populateData = (arr, brr, keyAdded) =>{
        return new Promise((res, rej)=>{
            for(let i in arr) brr.push(keyAdded(arr[i], brr.length));
            res();
        })
    }
    const sortData = (data) => {
        return new Promise((res, rej)=>{
            data.sort((a, b)=>a.key<b.key?-1:1);
            res();
        })
    }
    
    const params = {
        api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
        format: "json",
        start: source_params.start,
        end: source_params.end,
        filter_application: "Shark World,Shark Attack,Dino Battle,DINO WORLD,Dinosaur Zoo",
        columns: "day,application,network,network_placement,country,estimated_revenue"
    };
    console.log(Date.now());
    console.log(params);
    
    const fdatafetch = await axios.get(url + endPoint.maxReport, {params});

    console.log(`Fetched ${fdatafetch.data.results.length} data in ${Date.now()-fetchStart}ms`);

    await populateData(fdatafetch.data.results, fdata, (obj)=>{
        const key = obj.application.replace(/\s/g, '')+obj.network+obj.network_placement+obj.country;
        if(typeof(keymap[key]) === 'undefined') keymap[key] = keyno++;
        obj.key = keymap[key];
        return obj;
    });

    fetchStart = Date.now();
    params.start -= dif;
    params.end -= dif;

    const sdatafetch = await axios.get(url + endPoint.maxReport, {params});

    console.log(`Fetched ${sdatafetch.data.results.length} data in ${Date.now()-fetchStart}ms`);

    await populateData(sdatafetch.data.results, sdata, (obj, i)=>{
        const key = obj.application.replace(/\s/g, '')+obj.network+obj.network_placement+obj.country;
        if(typeof(keymap[key]) === 'undefined') keymap[key] = keyno++; 
        obj.key = keymap[key];
        return obj;
    });
    await sortData(sdata);

    const ans = await compare(fdata, sdata, source_params);

    return new Promise((res, rej)=>{
        id_ans[token] = ans;
        id_success[token] = true;
        console.log("total warnings found: " + id_ans[token].length);
        res({ans: id_ans[token], fdata: fdata, sdata: sdata});
    })
    
}

function param_handler(params){

    const hourToMs = (time) => time*36*1e5;
    const now = Date.now();
    const closeTime = now-now%hourToMs(1)-hourToMs(1);
    if(params.time_int>=0){
        params.time_int = hourToMs(params.time_int);
        if(params.time_int>fourteendays) return 0;
        params.end = closeTime;
        params.start = closeTime-params.time_int;
    } else {
        params.start = Date.parse(params.start);
        params.end = Date.parse(params.end);
        if(params.end<params.start) return 0;
    }
    return 1;    
}

app.get("/api", (req, res)=>{
    const def_params = {
        start: date.getFullYear().toString() +"-"+ ("0" + (date.getMonth()+1)).slice(-2) +"-"+ ("0" + date.getDate()).slice(-2)
            + "T" + ("0" + (date.getHours()-1)).slice(-2) + ":00:00",
        end: date.getFullYear().toString() +"-"+ ("0" + (date.getMonth()+1)).slice(-2) +"-"+ ("0" + date.getDate()).slice(-2)
            + "T" + ("0" + (date.getHours()-1)).slice(-2) + ":00:00",
        min_dif: 0,
        min_rev: 0,
        time_int: -3
    }
    if(Object.keys(req.query).length){
        console.log(req.query);
        def_params.start = req.query.start;
        def_params.end = req.query.end;
        def_params.min_dif = parseInt(req.query.min_dif);
        def_params.min_rev = parseFloat(req.query.min_rev);
        def_params.time_int = parseInt(req.query.time_int);
    }

    if(!param_handler(def_params)) res.status(400).send("Query Invalid");
    else{
        const token = uuidv4();
        id_success[token] = false;
        res.send(token);
        fetcher(def_params, token)
        .catch(err=>{console.log(err);});
    }
    
})

app.get("/com", (req, res)=>{
    const token = req.query.token;
    if(id_success[token]) {
        res.status(200).json(id_ans[token]);
        setTimeout(() => {
            delete id_success[token];
            delete id_ans[token];
        }, 600000);
    }
    else res.status(404).send("Loading");
})

const gra_success=[];
const gra_ans=[];

async function fracture(arr, date){

    const color = [
        "#ff3399", "#33ccff", "#99ff33", "#FF0000",	"#800000", "#FFFF00", "#808000", "#00FF00 ", "#008000 ", "#00FFFF", "#008080",
        "#0000FF", "#cc99ff", "#FF00FF", "#800080", "#CD5C5C"];
    let brr={
        labels:[],
        datasets:[]
    };
    for(let i=0; i<date.length; i++) brr.labels.push(date[i].day);

    for(let i=0; i<arr.length; i++){

        const pushobj = brr.datasets.find(obj=>obj.label===arr[i].campaign_package_name);
        if(!pushobj) {
            if(arr[i].day !== date[0].day){
                brr.datasets.push({
                    label: arr[i].campaign_package_name,
                    data: [0],
                    borderColor: color[brr.datasets.length],
                    backgroundColor: color[brr.datasets.length],
                    tension: 0.5,
                    borderWidth:1,
                })
                for(let j=1; j<date.length && arr[i].day !== date[j].day; j++) 
                    brr.datasets[brr.datasets.length-1].data.push(0);
                brr.datasets[brr.datasets.length-1].data.push(parseFloat(arr[i].average_cpa));
            }
            else brr.datasets.push({
                label:arr[i].campaign_package_name,
                data: [parseFloat(arr[i].average_cpa)],
                borderColor: color[brr.datasets.length],
                backgroundColor: color[brr.datasets.length],
                tension: 0.5,
                borderWidth: 1,
            });
        }
        else {
            const days = date.findIndex(obj=>obj.day===arr[i].day);
            while(pushobj.data.length < days) pushobj.data.push(0);
            pushobj.data.push(parseFloat(arr[i].average_cpa));
        }

    }
    return new Promise((res, rej)=>{
        res(brr);
    })
}

async function repGraph(source_params, token){

    const now = Date.now();
    const closeTime = now-now%dayToMs(1)-dayToMs(1);

    const params={
        api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
        format: "json",
        end: closeTime,
        start: closeTime-dayToMs(source_params.range-1),
        sort_day: "ASC",
        columns: "day,campaign_package_name,average_cpa",
        report_type: "advertiser"
    }

    const time_req = Date.now();

    console.log(`Fetching from ${url+endPoint.report}...`);

    const dates = await dateList({start: params.start, end: params.end}, url+endPoint.report);
    const data = await axios.get(url+endPoint.report, {params})
    console.log(`Fetched ${data.data.results.length} rows in ${Date.now()-time_req}ms`);
    const fracturedData = await fracture(data.data.results, dates);
    id_ans[token]=fracturedData;
    id_success[token]=true;
    return;
}

app.get("/rep", (req, res)=>{

    def_params={range: 3};
    if(Object.keys(req.query).length)def_params.range=req.query.range;

    const token=uuidv4();
    gra_success[token]=false;
    res.send(token);
    repGraph(def_params, token);

})

function compress_country(crr){
    const arr = JSON.parse(JSON.stringify(crr));
    return new Promise((res, rej)=>{
        const brr=[];
        if(!arr[0].country.length) arr[0].country='aa';
        brr.push(arr[0]);
        brr[0].average_cpa = parseFloat(brr[0].average_cpa);
        for(let i=1; i<arr.length; i++){
            if(!arr[i].country.length) arr[i].country='aa';
            if(arr[i].country===arr[i-1].country) {
                brr[brr.length-1].average_cpa = parseFloat(arr[i].average_cpa) + brr[brr.length-1].average_cpa;
            }
            else {
                brr.push(arr[i]);
                brr[brr.length-1].average_cpa = parseFloat(brr[brr.length-1].average_cpa);
            }
        }
        brr.sort((a, b)=>a.average_cpa<b.average_cpa?1:-1);
        const country = [];
        for(let i=0; i<5 && i<brr.length; i++) country.push(brr[i].country);
        res(country);
    })
}

function datagen(arr, country, date){
    return new Promise((res, rej)=>{
        const color =["#000080","#00FF00","#800080","#FF0000","#FFFF00"];
        const brr={
            labels: [],
            datasets: []
        };
        for(let i=0; i<date.length; i++) brr.labels.push(date[i].day);
        arr.sort((a, b)=>a.day>b.day?1:-1);
        for(let i=0; i<arr.length; i++){
            
            if(arr[i].country==='') arr[i].country='aa';
            if(country.find(cntry=>cntry===arr[i].country)){
                const pushobj = brr.datasets.find(obj=>obj.label===arr[i].country);
                if(!pushobj) {
                    if(arr[i].day !== date[0].day){
                        brr.datasets.push({
                            label: arr[i].country,
                            data: [0],
                            borderColor: color[brr.datasets.length],
                            backgroundColor: color[brr.datasets.length],
                            tension: 0.5,
                            borderWidth:1,
                            // fill: true,
                        });
                        for(let j=1; j<date.length && arr[i].day !== date[j].day; j++) 
                            brr.datasets[brr.datasets.length-1].data.push(0);
                        brr.datasets[brr.datasets.length-1].data.push(parseFloat(arr[i].average_cpa));
                    }
                    else
                        brr.datasets.push({
                            label: arr[i].country,
                            data: [parseFloat(arr[i].average_cpa)],
                            borderColor: color[brr.datasets.length],
                            backgroundColor: color[brr.datasets.length],
                            tension: 0.5,
                            borderWidth:1,
                            // fill: true,
                        });
                }
                else {
                    const days = date.findIndex(obj=>obj.day===arr[i].day);
                    while(pushobj.data.length < days) pushobj.data.push(0);
                    pushobj.data.push(parseFloat(arr[i].average_cpa));
                }
            }

        }
        res(brr);
    })
}

async function topcntry(source_params, token){
    
    const now = Date.now();
    const closeTime = now-now%dayToMs(1)-dayToMs(1);

    const params={
        api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
        format: "json",
        end: closeTime,
        start: closeTime-dayToMs(source_params.range-1),
        filter_campaign_package_name: source_params.filter,
        sort_country: "ASC",
        columns: "day,country,cost,average_cpa",
        report_type: "advertiser"
    }

    console.log(`Fetching from ${url+endPoint.report}...`);

    const dates = await dateList({start: params.start, end: params.end}, url+endPoint.report);
    const data = await axios.get(url+endPoint.report, {params}).catch(err=>{console.log(err);});
    const topCountryList = await compress_country(data.data.results);
    const ans = await datagen(data.data.results, topCountryList, dates);

    console.log(`Send Data for top five cpa counties in ${Date.now()-now}ms`);

    return new Promise((res, rej)=>{
        id_success[token]=true;
        id_ans[token]=ans;
        res();
    })
    
}

app.get("/topcntry", (req, res)=>{
//com.fpg.sharkattack
    const def_params={
        range: 3,
        filter: "com.fpg.sharkattack",
    }
    if(Object.keys(req.query).length){
        def_params.range = req.query.range;
        def_params.filter = req.query.filter;
    }

    const token=uuidv4();
    id_success[token]=false;
    res.send(token);

    topcntry(def_params, token).catch(err=>{console.log(err);});
})

async function mintegral(source_params){

    const past = (days) =>{
        let time = Date.now();
        time = time - time%dayToMs(1) - dayToMs(days);
        return (new Date(time)).toJSON().slice(0, 10);
    }

    const timestamp = Math.floor( (new Date()).getTime()/1000 ).toString();
    const api_key="a0f2ca38a43ce39ce8d4408cfa590111";
    const username="ziau";
    const mintegral="https://ss-api.mintegral.com/api/v2/reports/data?" + "username=" + username + "&token=" + md5(api_key + md5(timestamp)) + "&timestamp=" + timestamp;

    const params={
        timezone: "+6",
        start_time: past(source_params.range-1),
        end_time: past(1),
        format: "JSON",
        dimenstion_type: 0,
        type: 1
    }
    const reception = await axios.get(mintegral, {params});
    params.type=2;

    let ans=[];
    let success=false;
    const ping = async () =>{
        const responce = await axios.get(mintegral, {params});
        if(responce.status===200){
            success=true;
            ans=responce.data;
            return 1;
        }
        else setInterval(() => {
            ping();
        }, 750);
    }
    await ping();
    return ans;
}

app.get("/twoApi", (req, res)=>{
    const def_params={
        range: 3
    }
    if(Object.keys(req.query).length){
        def_params.range = req.query.range
    }

    mintegral(def_params)
    .then(data=>res.send(data))
    .catch(err=>{console.log(err);});
})

//86400000
app.listen(PORT, ()=>{
    console.log(`listening to port ${PORT}...`);
})
