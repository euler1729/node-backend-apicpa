const express = require('express');
const cors = require("cors");
const axios = require('axios');
const {v4 : uuidv4} = require('uuid');
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
const fourteendays=1209600000;              // 14 days in millisecond
const hourToMs = (time) => time*36*1e5;     //converts one hour to millisecond
const dayToMs = (day) => day*864*1e5;       //converts one day to millisecond
const pastDay = (days) =>{                  //finds the date (days) before now. pastDay(1) is the date of yesterday in the form YYYY-MM-DD
    let time = Date.now();
    time = time - time%dayToMs(1) - dayToMs(days);
    return (new Date(time)).toJSON().slice(0, 10); 
}                                           
const pastTime = (hours) =>{                //finds the time (hours) before now. pastTime(1) is the last complete hour in the form HH:MM
    let time = Date.now();
    time = time - time%hourToMs(1) - hourToMs(hours);
    return (new Date(time)).toJSON().slice(11, 16);
}

//range must have start and end properties. both in milliseconds
async function dateList(range){

    let brr=[];
    let pushDate=range.start;
    brr.push((new Date(pushDate).toJSON().slice(0, 10)));

    while(pushDate!==range.end){
        pushDate+=dayToMs(1);
        brr.push((new Date(pushDate).toJSON().slice(0, 10)));
    }

    return new Promise((res, rej)=>{
        res(brr);
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
var ironSource_auth;

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

app.get("/api", (req, res)=>{
    const def_params = {
        start: pastDay(0) + 'T' + pastTime(3),
        end: pastDay(0) + 'T' + pastTime(1),
        filter_app: "Shark World,Shark Attack,Dino Battle,DINO WORLD,Dinosaur Zoo",
        min_dif: 0,
        min_rev: 0,
        time_int: -3
    }
    if(Object.keys(req.query).length){
        def_params.start = req.query.start;
        def_params.end = req.query.end;
        if(req.query.filter_app) def_params.filter_app=req.query.filter_app;
        def_params.min_dif = parseInt(req.query.min_dif);
        def_params.min_rev = parseFloat(req.query.min_rev);
        def_params.time_int = parseInt(req.query.time_int);
    }

    const WarningTable = require("../warning_table.js");
    console.log(typeof(WarningTable));
    const warning_table = new WarningTable(id_success, id_ans)

    if(!warning_table.param_handler(def_params)) res.status(400).send("Query Invalid");
    else {
        const token=uuidv4();
        id_success[token]=false;
        warning_table.setToken(token);
        res.send(token);
        warning_table.fetcher(def_params);
    }
})

app.get("/rep", (req, res)=>{

    def_params={range: 3};
    if(Object.keys(req.query).length)def_params.range=req.query.range;

    const CPAGraph=require('../cpa_graph.js');
    const cpa_graph=new CPAGraph(id_success, id_ans);

    const token=uuidv4();
    id_success[token]=false;
    cpa_graph.setToken(token);
    res.send(token);
    cpa_graph.repGraph(def_params);

})

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

    const CPACountryGraph=require('../cpa_country_graph');
    const cpa_country_graph=new CPACountryGraph(id_success, id_ans);

    const token=uuidv4();
    id_success[token]=false;
    cpa_country_graph.setToken(token);
    res.send(token);

    cpa_country_graph.topcntry(def_params);
})

//requires range in source_params
async function mintegral(source_params){

    const now=Date.now();
    console.log("Fetching from mintegral API...");

    const timestamp = Math.floor( (new Date()).getTime()/1000 ).toString();
    const api_key="a0f2ca38a43ce39ce8d4408cfa590111";
    const username="ziau";
    const mintegral_url="https://ss-api.mintegral.com/api/v2/reports/data?" + "username=" + username + "&token=" + md5(api_key + md5(timestamp)) + "&timestamp=" + timestamp;

    const params={
        timezone: "+6",
        start_time: pastDay(source_params.range),
        end_time: pastDay(1),
        format: "JSON",
        dimenstion_type: 0,
        type: 1
    }
    const reception = await axios.get(mintegral_url, {params});
    params.type=2;

    let ans=[];
    let success=false;

    const objectifyData = (arr, dest_params) =>{
        const brr=arr.split('\n');
        brr[0]=brr[0].split('\t');
        for(let i in brr[0]) brr[0][i] = brr[0][i].replace(/\s/g, '');
        let crr=[];
        for(let i=1; i<brr.length-1; i++){
            brr[i]=brr[i].split('\t');
            brr[i][0] = brr[i][0].slice(0, 4) + '-' + brr[i][0].slice(4, 6) + '-' + brr[i][0].slice(6);
            const pushObj=crr.find(ob=>ob.date===brr[i][0]);
            if(!pushObj) {
                crr.push({
                    date: brr[i][0],
                    eCPM: parseFloat(brr[i][7])
                });
            }
            else{
                pushObj.eCPM = parseFloat(brr[i][7]) + pushObj.eCPM;
            }            
        }
        return new Promise((res, rej)=>{
            res(crr);
        })
    }

    const ping = async () =>{
        const responce = await axios.get(mintegral_url, {params});
        if(responce.status===200){
            success=true;
            ans=await objectifyData(responce.data);
            return 1;
        }
        else setInterval(() => {
            ping();
        }, 750);
    }
    await ping();
    // console.log(ans);
    console.log(`Fetched ${ans.length} data from mintegral in ${Date.now()-now}ms`);
    return ans;
}

//requires metrics and range in source_params
async function is(source_params) {

    const now = Date.now();
    console.log("Fetching from ironSource API...");

    const auth_url="https://platform.ironsrc.com/partners/publisher/auth";
    const req_url="https://platform.ironsrc.com/partners/publisher/mediation/applications/v6/stats";
    const headers={
        secretkey: '7f9d6dcdc53d127e16df780183d8554a',
        refreshToken: '90a0340af3ae4858a8245e8b49dfad4d'
    }
    const params={
        startDate: pastDay(source_params.range),
        endDate: pastDay(1),
        metrics: source_params.metrics,
        // breakdown: "date"
    }
    if(!ironSource_auth) {
        const auth_res=await axios.get(auth_url, {headers: headers});
        ironSource_auth = auth_res.data;
    }
    const data=await axios.get(req_url, {
        headers: {
            Authorization: 'Bearer ' + ironSource_auth
        },
        params: params
    })
    console.log(`Fetched ${data.data.length} data from ironSource in ${Date.now()-now}ms`);

    const compress = (arr) =>{
        let crr=[];
        for(let i in arr){
            const pushObj=crr.find(obj=>obj.date===arr[i].date);
            if(!pushObj){
                crr.push({
                    date: arr[i].date,
                    eCPM: parseFloat(arr[i].data[0].eCPM)
                })
            }
            else pushObj.eCPM=parseFloat(arr[i].data[0].eCPM)+pushObj.eCPM;
        }
        return new Promise((res, rej)=>{
            res(crr);
        })
    }

    return compress(data.data);
}

//requires range in source_params
async function applovin(source_params){

    const now=Date.now();
    console.log("Fetching from applovin API...");

    const applovin_url="https://r.applovin.com/report";
    const params={
        api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
        format: "json",
        start: pastDay(source_params.range),
        end: pastDay(1),
        sort_day: "ASC",
        columns: "day,ecpm"
    }
    const data=await axios.get(applovin_url, {params});
    console.log(`Fetched ${data.data.results.length} data from applovin in ${Date.now()-now}ms`);
    return data.data.results;
}

async function compareAPIdata(source_params){

    let now = Date.now();
    now = now-now%dayToMs(1)-dayToMs(1);

    const date=await dateList({start: now-dayToMs(source_params.range-1), end: now});

    const mintegral_data=await mintegral(source_params)
    const ironSource_data=await is(source_params);
    const applovin_data=await applovin(source_params);
    
    const datagen = (date, mint, is, aplov) => {
        let brr={
            labels:[],
            datasets:[]
        };

        for(let i in date) brr.labels.push(date[i]);

        brr.datasets.push({
            label: "mintegral",
            data: mintegral_data[0].date===date[0]?[mintegral_data[0].eCPM]:[0],
            borderColor: "#C0C0C0",
            tension: 0.5
        })
        brr.datasets.push({
            label: "ironSource",
            data: ironSource_data[0].date===date[0]?[ironSource_data[0].eCPM]:[0],
            borderColor: "#808080",
            tension: 0.5
        })
        brr.datasets.push({
            label: "applovin",
            data: applovin_data[0].day===date[0]?[applovin_data[0].ecpm]:[0],
            borderColor: "#CD5C5C",
            tension: 0.5
        })

        for(let i=1; i<date.length; i++){
            brr.datasets[0].data.push(mintegral_data[i].date===date[i]?mintegral_data[i].eCPM:0);
            brr.datasets[1].data.push(ironSource_data[i].date===date[i]?ironSource_data[i].eCPM:0);
            brr.datasets[2].data.push(applovin_data[i].day===date[i]?applovin_data[i].ecpm:0);
        }
        return new Promise((res, rej)=>{
            res(brr);
        })
    }
    // return {mintegral_data, ironSource_data, applovin_data};
    return datagen(date, mintegral_data, ironSource_data, applovin_data);
}

app.get("/compApi", (req, res)=>{
    const def_params={range: 3, metrics: "eCPM"};
    if(Object.keys(req.query).length){
        def_params.range=req.query.range;
    }
    compareAPIdata(def_params)
    .then(data=>{res.send(data);})
    .catch(err=>{console.log(err);});

})

//86400000
app.listen(PORT, ()=>{
    console.log(`listening to port ${PORT}...`);
})
