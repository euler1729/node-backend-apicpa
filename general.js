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
            '#F44336','#FFEBEE','#FFCDD2','#EF9A9A','#E57373','#EF5350','#E53935','#D32F2F','#C62828','#B71C1C','#FF8A80','#FF5252','#FF1744','#D50000','#FCE4EC','#F8BBD0','#F48FB1','#F06292','#EC407A','#E91E63','#D81B60','#C2185B','#AD1457','#880E4F','#FF80AB','#FF4081','#F50057','#C51162','#F3E5F5','#E1BEE7','#CE93D8','#BA68C8','#AB47BC','#9C27B0','#8E24AA','#7B1FA2','#6A1B9A','#4A148C','#EA80FC','#E040FB','#D500F9','#AA00FF','#EDE7F6','#D1C4E9','#B39DDB','#9575CD','#7E57C2','#673AB7','#5E35B1','#512DA8','#4527A0','#311B92','#B388FF','#7C4DFF','#651FFF','#6200EA','#E8EAF6','#C5CAE9','#9FA8DA','#7986CB','#5C6BC0','#3F51B5','#3949AB','#303F9F','#283593','#1A237E','#8C9EFF','#536DFE','#3D5AFE','#304FFE','#E3F2FD','#BBDEFB','#90CAF9','#64B5F6','#42A5F5','#2196F3','#1E88E5','#1976D2','#1565C0','#0D47A1','#82B1FF','#448AFF','#2979FF','#2962FF','#E1F5FE','#B3E5FC','#81D4FA','#4FC3F7','#29B6F6','#03A9F4','#039BE5','#0288D1','#0277BD','#01579B','#80D8FF','#40C4FF','#00B0FF','#0091EA','#E0F7FA','#B2EBF2','#80DEEA','#4DD0E1','#26C6DA','#00BCD4','#00ACC1','#0097A7','#00838F','#6064CA','#84FFFF','#18FFFF','#00E5FF','#00B8D4','#E0F2F1','#B2DFDB','#80CBC4','#4DB6AC','#26A69A','#9688CA','#00897B','#00796B','#00695C','#004D40','#A7FFEB','#64FFDA','#1DE9B6','#00BFA5','#E8F5E9','#C8E6C9','#A5D6A7','#81C784','#66BB6A','#4CAF50','#43A047','#388E3C','#2E7D32','#1B5E20','#B9F6CA','#69F0AE','#00E676','#00C853','#F1F8E9','#DCEDC8','#C5E1A5','#AED581','#9CCC65','#8BC34A','#7CB342','#689F38','#558B2F','#33691E','#CCFF90','#B2FF59','#76FF03','#64DD17','#F9FBE7','#F0F4C3','#E6EE9C','#DCE775','#D4E157','#CDDC39','#C0CA33','#AFB42B','#9E9D24','#827717','#F4FF81','#EEFF41','#C6FF00','#AEEA00','#FFFDE7','#FFF9C4','#FFF59D','#FFF176','#FFEE58','#FFEB3B','#FDD835','#FBC02D','#F9A825','#F57F17','#FFFF8D','#FFFF00','#FFEA00','#FFD600','#FFF8E1','#FFECB3','#FFE082','#FFD54F','#FFCA28','#FFC107','#FFB300','#FFA000','#FF8F00','#FF6F00','#FFE57F','#FFD740','#FFC400','#FFAB00','#FFF3E0','#FFE0B2','#FFCC80','#FFB74D','#FFA726','#FF9800','#FB8C00','#F57C00','#EF6C00','#E65100','#FFD180','#FFAB40','#FF9100','#FF6D00','#FBE9E7','#FFCCBC','#FFAB91','#FF8A65','#FF7043','#FF5722','#F4511E','#E64A19','#D84315','#BF360C','#FF9E80','#FF6E40','#FF3D00','#DD2C00','#EFEBE9','#D7CCC8','#BCAAA4','#A1887F','#8D6E63','#795548','#6D4C41','#5D4037','#4E342E','#3E2723','#FAFAFA','#F5F5F5','#EEEEEE','#E0E0E0','#BDBDBD','#9E9E9E','#757575','#616161','#424242','#212121','#ECEFF1','#CFD8DC','#B0BEC5','#90A4AE','#78909C','#607D8B','#546E7A','#455A64','#37474F','#263238','#0'
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