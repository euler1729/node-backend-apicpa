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
        def_params.filter_app=req.query.filter_app;
        def_params.min_dif = parseInt(req.query.min_dif);
        def_params.min_rev = parseFloat(req.query.min_rev);
        def_params.time_int = parseInt(req.query.time_int);
    }

    const WarningTable = require("../warning_table.js");
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

    def_params={
        range: 3,
        metrics: "installs,spend",  //for ironSource
        breakdowns: "day,title",  //for ironSource
        columns: "day,campaign_package_name,conversions,cost"
    };
    if(Object.keys(req.query).length)def_params.range=req.query.range;

    const CPAGraph=require('../cpa_graph.js');
    const cpa_graph=new CPAGraph(id_success, id_ans);

    const token=uuidv4();
    id_success[token]=false;
    cpa_graph.setToken(token);
    res.send(token);
    // console.log(token);
    cpa_graph.fetcher(def_params);

})

app.get("/topcntry", (req, res)=>{
//com.fpg.sharkattack
    const def_params={
        range: 3,
        dimension: "location",      //for ming
        metrics: "installs,spend",  //for ironSource
        breakdowns: "day,country",  //for ironSource
        columns: "day,country,conversions,cost",    //for applovin
        app_filter: "com.tappocket.dragonvillage"
    }
    if(Object.keys(req.query).length){
        def_params.range = req.query.range;
        def_params.app_filter = req.query.filter;
    }

    const CPACountryGraph=require('../cpa_country_graph');
    const cpa_country_graph=new CPACountryGraph(id_success, id_ans);

    const token=uuidv4();
    id_success[token]=false;
    cpa_country_graph.setToken(token);
    res.send(token);
    // console.log(token);

    cpa_country_graph.fetcher(def_params);
})

//requires range in source_params
async function mintegral_advanced(source_params){

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



app.get("/mint", (req, res)=>{
    def_params={
        range: 3,
        // dimension: "location",
        // app_filter: "com.tappocket.dragonvillage"
    };
    const General=require('../general.js');
    const general=new General();
    general.mintegral(def_params, (arr)=>{
        // console.log(arr);
        const brr=[];
        for(let i=0; i<arr.length-1; i++){
            let pushObj=brr.find(obj=>((obj.date===arr[i].date)&&(obj.package_name===arr[i].package_name)))
            if(!pushObj){
                brr.push({
                    date: arr[i].date,
                    package_name: arr[i].package_name,
                    install: arr[i].install,
                    spend: arr[i].spend,
                    // package_name: arr[i].package_name
                })
            }
            else {
                pushObj.install += arr[i].install;
                pushObj.spend += arr[i].spend;
            }
        }
        return new Promise((res, rej)=>{
            res(brr);
        });
    })
    .then(data=>{res.send(data);})
    .catch(err=>{console.log(err);});
})

app.get("/is", (req, res)=>{
    const def_params={
        range: 3,
        // app_filter: "com.tappocket.dragonvillage",
        metrics: "installs,spend",
        breakdowns: "day,title"         //title breakdowns give titleBundleId
    }

    const General=require('../general.js');
    const general=new General();
    general.is(def_params, (arr)=>{
        // console.log(arr);
        const brr=[];
        for(let i in arr){
            brr.push({
                date: arr[i].date.slice(0, 10),
                package_name: arr[i].titleBundleId,
                install: arr[i].installs,
                spend: arr[i].spend
            })
        }
        return new Promise((res, rej)=>{
            res(brr);
        })
    })
    .then(data=>(res.send(data)))
    .catch(err=>{console.log(err);});
})

app.get("/app", (req, res)=>{
    const def_params={
        range: 3,
        // app_filter: "com.tappocket.dragonvillage",
        columns: "day,campaign_package_name,conversions,cost"
    };

    const General=require('../general.js');
    const general=new General();
    general.applovin(def_params, (arr)=>{
        const brr=[];
        for(let i=0; i<arr.length; i++){
            brr.push({
                date: arr[i].day,
                bundleId: arr[i].campaign_package_name,
                install: arr[i].conversions,
                spend: arr[i].cost
            })
        }
        return brr;
    })
    .then(data=>(res.send(data)))
    .catch(err=>{console.log(err);});
})

async function compareAPIdata(source_params, token){

    let now = Date.now();
    now = now-now%dayToMs(1)-dayToMs(1);

    const date=await dateList({start: now-dayToMs(source_params.range-1), end: now});

    const mintegral_data=await mintegral(source_params, (arr)=>{
        const brr=[];
        for(let i=0; i<arr.length-1; i++){
            let pushObj=brr.find(obj=>obj.date===arr[i].date)
            if(!pushObj){
                brr.push({
                    date: arr[i].date,
                    install: arr[i].install,
                    spend: arr[i].spend,
                    cpi: 0
                })
            }
            else {
                pushObj.install += arr[i].install;
                pushObj.spend += arr[i].spend;
            }
        }
        for(let obj of brr) obj.cpi=obj.install/obj.spend;
        return brr;
    })
    mintegral_data.sort((a, b)=>a.date>b.date?1:-1);
    const ironSource_data=await is(source_params, (arr)=>{
        const brr=[];
        for(let i in arr){
            brr.push({
                date: arr[i].date.slice(0, 10),
                cpa: arr[i].spend?parseFloat(arr[i].installs)/arr[i].spend:0
            })
        }
        return brr;
    });
    ironSource_data.sort((a, b)=>a.date>b.date?1:-1);
    const applovin_data=await applovin(source_params);
    applovin_data.sort((a, b)=>a.date>b.date?1:-1);

    const datagen = (date, mint, is, aplov) => {
        let brr={
            labels:[],
            datasets:[]
        };

        for(let i in date) brr.labels.push(date[i]);

        brr.datasets.push({
            label: "mintegral",
            data: mintegral_data[0].date===date[0]?[mintegral_data[0].cpi]:[0],
            borderColor: "#C0C0C0",
            tension: 0.5,
            borderWidth:1,
        })
        brr.datasets.push({
            label: "ironSource",
            data: ironSource_data[0].date===date[0]?[ironSource_data[0].cpa]:[0],
            borderColor: "#808080",
            tension: 0.5,
            borderWidth:1,
        })
        brr.datasets.push({
            label: "applovin",
            data: applovin_data[0].day===date[0]?[applovin_data[0].average_cpa]:[0],
            borderColor: "#CD5C5C",
            tension: 0.5,
            borderWidth:1,
        })

        for(let i=1; i<date.length; i++){
            brr.datasets[0].data.push(mintegral_data[i].date===date[i]?mintegral_data[i].cpi:0);
            brr.datasets[1].data.push(ironSource_data[i].date===date[i]?ironSource_data[i].cpa:0);
            brr.datasets[2].data.push(applovin_data[i].day===date[i]?applovin_data[i].average_cpa:0);
        }
        return new Promise((res, rej)=>{
            res(brr);
        })
    }
    // return {mintegral_data, ironSource_data, applovin_data};
    id_ans[token]=await datagen(date, mintegral_data, ironSource_data, applovin_data);
    id_success[token]=true;
    return ;
}

app.get("/compApi", (req, res)=>{
    const def_params={range: 3, metrics: "installs,spend"};
    if(Object.keys(req.query).length){
        def_params.range=req.query.range;
    }

    const token=uuidv4();
    id_success[token]=false;
    res.send(token);

    compareAPIdata(def_params, token);
})

//86400000
app.listen(PORT, ()=>{
    console.log(`listening to port ${PORT}...`);
})
