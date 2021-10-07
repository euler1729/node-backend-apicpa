module.exports=class CPAGraph{
    constructor(id_success, id_ans){
        this.id_success=id_success;
        this.id_ans=id_ans
        this.axios=require('axios');
    }

    setToken(token){
        this.token=token
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

    async fracture(arr, date){

        const color = [
            "#C0C0C0", "#808080", "#000000", "#FF0000",	"#800000", "#FFFF00", "#808000", "#00FF00 ", "#008000 ", "#00FFFF", "#008080",
            "#0000FF", "#000080", "#FF00FF", "#800080", "#CD5C5C"];
        let brr={
            labels:[],
            datasets:[]
        };
        for(let i=0; i<date.length; i++) brr.labels.push(date[i]);

        for(let i=0; i<arr.length; i++){

            const pushobj = brr.datasets.find(obj=>obj.label===arr[i].campaign_package_name);
            if(!pushobj) {
                if(arr[i].day !== date[0]){
                    brr.datasets.push({
                        label: arr[i].campaign_package_name,
                        data: [0],
                        borderColor: color[brr.datasets.length-1],
                        tension: 0.5
                    })
                    for(let j=1; j<date.length && arr[i].day !== date[j]; j++) 
                        brr.datasets[brr.datasets.length-1].data.push(0);
                    brr.datasets[brr.datasets.length-1].data.push(parseFloat(arr[i].average_cpa));
                }
                else brr.datasets.push({
                    label:arr[i].campaign_package_name,
                    data: [parseFloat(arr[i].average_cpa)],
                    borderColor: color[brr.datasets.length-1],
                    tension: 0.5
                });
            }
            else {
                const days = date.findIndex(obj=>obj===arr[i].day);
                while(pushobj.data.length < days) pushobj.data.push(0);
                pushobj.data.push(parseFloat(arr[i].average_cpa));
            }

        }
        return new Promise((res, rej)=>{
            res(brr);
        })
    }

    async repGraph(source_params){

        const now = Date.now();
        const closeTime = now-now%this.dayToMs(1)-this.dayToMs(1);

        const url="http://r.applovin.com/report";

        const params={
            api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
            format: "json",
            end: closeTime,
            start: closeTime-this.dayToMs(source_params.range-1),
            sort_day: "ASC",
            columns: "day,campaign_package_name,average_cpa",
            report_type: "advertiser"
        }

        const time_req = Date.now();

        console.log(`Fetching from ${url}...`);

        const dates = await this.dateList({start: params.start, end: params.end});
        const data = await this.axios.get(url, {params})
        console.log(`Fetched ${data.data.results.length} rows in ${Date.now()-time_req}ms`);
        const fracturedData = await this.fracture(data.data.results, dates);
        this.id_ans[this.token]=fracturedData;
        this.id_success[this.token]=true;
        return;
    }
}