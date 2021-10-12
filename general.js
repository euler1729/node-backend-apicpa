module.exports=class General{

    static ironSource_auth;

    md5=require('js-md5');

    axios=require('axios')

    hourToMs = (time) => time*36*1e5;     //converts one hour to millisecond

    dayToMs = (day) => day*864*1e5;       //converts one day to millisecond

    pastDay = (days) =>{                  //finds the date (days) before now. pastDay(1) is the date of yesterday in the form YYYY-MM-DD
        let time = Date.now();
        time = time - time%this.dayToMs(1) - this.dayToMs(days);
        return (new Date(time)).toJSON().slice(0, 10); 
    }

    pastTime = (hours) =>{                //finds the time (hours) before now. pastTime(1) is the last complete hour in the form HH:MM
        let time = Date.now();
        time = time - time%this.hourToMs(1) - this.hourToMs(hours);
        return (new Date(time)).toJSON().slice(11, 16);
    }

    binarySearch(arr, val, compare) {
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

    color = [
        '#ae30d1',
        '#e27add',
        '#ad4e2b',
        '#5ad617',
        '#fcdf94',
        '#f9a4b8',
        '#adffc0',
        '#70e23b',
        '#627cc4',
        '#efcba7',
        '#137184',
        '#c14819',
        '#d89365',
        '#bce7ff',
        '#70f4d5',
        '#c691ea',
        '#ed7b8e',
        '#a9c7e8',
        '#6953e2',
        '#f4a4c7',
        '#f9e070',
        '#1298d1',
        '#eadb02',
        '#fc14e9',
        '#1db215',
        '#b8d33f',
        '#4cef40',
        '#982bf2',
        '#edb253',
        '#690caf',
        '#06a30b',
        '#cfbfff',
        '#8ee886',
        '#5edb68',
        '#067f6d',
        '#93143c',
        '#58cc2a',
        '#d86ccd',
        '#e26c04',
        '#2de282',
        '#f29398',
        '#34af03',
        '#edc363',
        '#5ed6ca',
        '#1cdb42',
        '#c7d843',
        '#e8ed8e',
        '#b890db',
    ];

    //range must have start and end properties. both in milliseconds
    dateList(range){

        let brr=[];
        let pushDate=range.start;
        brr.push((new Date(pushDate).toJSON().slice(0, 10)));

        while(pushDate<range.end){
            pushDate+=this.dayToMs(1);
            brr.push((new Date(pushDate).toJSON().slice(0, 10)));
        }

        return new Promise((res,rej)=>{
            res(brr);
        })
    }

    //requires range dimestions and appFIlter in source_params
    async mintegral(source_params, func = (arr) => arr){
        console.log("Fetching from mintegral API...");

        const now = Date.now();
        const closetime = now-now%this.dayToMs(1)-this.dayToMs(1);

        const timestamp = Math.floor( (new Date()).getTime()/1000 ).toString();
        const api_key="a0f2ca38a43ce39ce8d4408cfa590111";
        const username="ziau";
        const mintegral_url="https://ss-api.mintegral.com/api/v1/reports/data?" + "username=" + username + "&token=" + this.md5(api_key + this.md5(timestamp)) + "&timestamp=" + timestamp;

        const params={
            timezone: "+6",
            start_time: Math.floor((closetime-this.dayToMs(source_params.range-1))/1000),
            end_time: Math.floor((closetime)/1000),
            dimension: source_params.dimension,
            package_name: source_params.app_filter
        }
        // console.log(params);
        const data=await this.axios.get(mintegral_url, {params});
        const ans=await func(data.data.data);

        console.log(`Fetched ${data.data.data.length} data in ${Date.now()-now}ms`);

        // console.log(ans);
        return ans;
    }
    
    //requires metrics breakdowns range and appfilter in source_params
    async is(source_params, func=(arr)=>arr) {

        const now = Date.now();
        console.log("Fetching from ironSource API...");

        const auth_url="https://platform.ironsrc.com/partners/publisher/auth";
        const req_url="https://api.ironsrc.com/advertisers/v2/reports?";

        if(!this.ironSource_auth) {
            const auth_res=await this.axios.get(auth_url, {headers: {
                secretkey: '7f9d6dcdc53d127e16df780183d8554a',
                refreshToken: '90a0340af3ae4858a8245e8b49dfad4d'
            }});
            this.ironSource_auth = auth_res.data;
        }
        const data=await this.axios.get(req_url, {
            headers: {
                Authorization: 'Bearer ' + this.ironSource_auth
            },
            params: {
                startDate: this.pastDay(source_params.range),
                endDate: this.pastDay(1),
                bundleId: source_params.app_filter,
                metrics: source_params.metrics,
                breakdowns: source_params.breakdowns
            }
        })
        console.log(`Fetched ${data.data.data.length} data from ironSource in ${Date.now()-now}ms`);
        const ans=await func(data.data.data);
        return ans;
    }

    //requires range columns and appfilter in source_params
    async applovin(source_params, func=(arr)=>arr){

        const now=Date.now();
        console.log("Fetching from applovin API...");

        const applovin_url="https://r.applovin.com/report";
        const params={
            api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
            format: "json",
            start: this.pastDay(source_params.range),
            end: this.pastDay(1),
            sort_day: "DESC",
            columns: source_params.columns,
            filter_campaign_package_name: source_params.app_filter,
            report_type: "advertiser"
        }
        const data=await this.axios.get(applovin_url, {params});
        console.log(`Fetched ${data.data.results.length} data from applovin in ${Date.now()-now}ms`);
        const ans=await func(data.data.results);
        return ans;
    }

    async unity(source_params, func=(arr)=>arr){

        const now =Date.now();
        console.log("Fetching data from Unity API");

        const url="https://stats.unityads.unity3d.com/organizations/5c46f835a31702001cf702f7/reports/acquisitions?"

        //start and end special for unity. I don't know why.
        //update: start and end now works un-differently. what is happening
        let params={
            apikey: "a6b260c4b4b869012b29536df455ccca9bd7b9865736fb552b8b3da2555e7dd4",
            start: (this.pastDay(source_params.range)),
            end: (this.pastDay(0)),
            scale: source_params.scale,
            splitBy: source_params.splitBy,
            fields: source_params.fields
        }
        const data=await this.axios(url, {params});
        console.log(`Fetched ${data.data.length} data from unity in ${Date.now()-now}ms`);
        const ans=await func(data.data);
        return ans;
    }
}