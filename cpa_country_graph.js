module.exports=class CPACountryGraph{
    constructor(id_success, id_ans){
        this.id_success=id_success;
        this.id_ans=id_ans;
        this.axios=require('axios');
    }

    setToken(token){
        this.token=token;
    }

    dayToMs = (day) => day*864*1e5;       //converts one day to millisecond

    async dateList(range){

        let brr=[];
        let pushDate=range.start;
        brr.push((new Date(pushDate).toJSON().slice(0, 10)));

        while(pushDate!==range.end){
            pushDate+=this.dayToMs(1);
            brr.push((new Date(pushDate).toJSON().slice(0, 10)));
        }

        return new Promise((res, rej)=>{
            res(brr);
        })
    }

    compress_country(crr){
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

    datagen(arr, country, date){
        return new Promise((res, rej)=>{
            const color =["#CB4335","#7D3C98","#21618C","#1E8449","#F1C40F"];
            const brr={
                labels: [],
                datasets: []
            };
            for(let i=0; i<date.length; i++) brr.labels.push(date[i]);
            arr.sort((a, b)=>a.day>b.day?1:-1);
            for(let i=0; i<arr.length; i++){
                
                if(arr[i].country==='') arr[i].country='aa';
                if(country.find(cntry=>cntry===arr[i].country)){
                    const pushobj = brr.datasets.find(obj=>obj.label===arr[i].country);
                    if(!pushobj) {
                        if(arr[i].day !== date[0]){
                            brr.datasets.push({
                                label: arr[i].country,
                                data: [0],
                                borderColor: color[brr.datasets.length-1],
                                backgroundColor: color[brr.datasets.length-1],
                                tension: 0.5,
                                borderWidth:1,
                            });
                            for(let j=1; j<date.length && arr[i].day !== date[j]; j++) 
                                brr.datasets[brr.datasets.length-1].data.push(0);
                            brr.datasets[brr.datasets.length-1].data.push(parseFloat(arr[i].average_cpa));
                        }
                        else
                            brr.datasets.push({
                                label: arr[i].country,
                                data: [parseFloat(arr[i].average_cpa)],
                                borderColor: color[brr.datasets.length-1],
                                backgroundColor: color[brr.datasets.length-1],
                                tension: 0.5,
                                borderWidth:1,
                            });
                    }
                    else {
                        const days = date.findIndex(obj=>obj===arr[i].day);
                        while(pushobj.data.length < days) pushobj.data.push(0);
                        pushobj.data.push(parseFloat(arr[i].average_cpa));
                    }
                }

            }
            res(brr);
        })
    }

    async topcntry(source_params){
    
        const now = Date.now();
        const closeTime = now-now%this.dayToMs(1)-this.dayToMs(1);

        const url="http://r.applovin.com/report";

        const params={
            api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
            format: "json",
            end: closeTime,
            start: closeTime-this.dayToMs(source_params.range-1),
            filter_campaign_package_name: source_params.filter,
            sort_country: "ASC",
            columns: "day,country,cost,average_cpa",
            report_type: "advertiser"
        }

        console.log(`Fetching from ${url}...`);

        const dates = await this.dateList({start: params.start, end: params.end});
        const data = await this.axios.get(url, {params}).catch(err=>{console.log(err);});
        const topCountryList = await this.compress_country(data.data.results);
        const ans = await this.datagen(data.data.results, topCountryList, dates);

        console.log(`Send Data for top five cpa counties in ${Date.now()-now}ms`);

        return new Promise((res, rej)=>{
            this.id_success[this.token]=true;
            this.id_ans[this.token]=ans;
            res();
        })
        
    }
}