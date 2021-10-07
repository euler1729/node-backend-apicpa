module.exports=class WarningTable{
    constructor(id_success, id_ans){
        this.id_success=id_success;
        this.id_ans=id_ans;
        this.fourteendays=1209600000;
        this.axios=require('axios');
    }

    setToken(token){
        this.token=token;
    }
    
    hourToMs = (time) => time*36*1e5;
    
    populateData = (arr, brr, keyAdded) =>{
        return new Promise((res, rej)=>{
            for(let i in arr) brr.push(keyAdded(arr[i], brr.length));
            res();
        })
    }

    sortData = (data) => {
        return new Promise((res, rej)=>{
            data.sort((a, b)=>a.key<b.key?-1:1);
            res();
        })
    }

    param_handler(params){

        const now = Date.now();
        const closeTime = now-now%this.hourToMs(1)-this.hourToMs(1);
        if(params.time_int>=0){
            params.time_int = this.hourToMs(params.time_int);
            if(params.time_int>this.fourteendays) return 0;
            params.end = closeTime;
            params.start = closeTime-params.time_int;
        } else {
            params.start = Date.parse(params.start);
            params.end = Date.parse(params.end);
            if(params.end<params.start) return 0;
        }
        return 1;    
    }

    compare(fdata, sdata, params){
    
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

    async fetcher(source_params){

        const url="http://r.applovin.com/maxReport"
        console.log(`Fetching from ${url}...`);
        let fetchStart = Date.now();

        const fdata=[];
        const sdata=[];
        let keymap=[];
        let keyno=0;

        const dif=source_params.end-source_params.start;
        
        const params = {
            api_key: "U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI",
            format: "json",
            start: source_params.start,
            end: source_params.end,
            filter_application: source_params.filter_app,
            columns: "day,application,network,network_placement,country,estimated_revenue"
        };
        
        const fdatafetch = await this.axios.get(url, {params});

        await this.populateData(fdatafetch.data.results, fdata, (obj)=>{
            const key = obj.application.replace(/\s/g, '')+obj.network+obj.network_placement+obj.country;
            if(typeof(keymap[key]) === 'undefined') keymap[key] = keyno++;
            obj.key = keymap[key];
            return obj;
        });

        params.start -= dif;
        params.end -= dif;

        const sdatafetch = await this.axios.get(url, {params});

        console.log(`Fetched ${sdatafetch.data.results.length} and ${fdatafetch.data.results.length} data in ${Date.now()-fetchStart}ms`);

        await this.populateData(sdatafetch.data.results, sdata, (obj, i)=>{
            const key = obj.application.replace(/\s/g, '')+obj.network+obj.network_placement+obj.country;
            if(typeof(keymap[key]) === 'undefined') keymap[key] = keyno++; 
            obj.key = keymap[key];
            return obj;
        });
        await this.sortData(sdata);

        const ans = await this.compare(fdata, sdata, source_params);

        return new Promise((res, rej)=>{
            this.id_ans[this.token] = ans;
            this.id_success[this.token] = true;
            console.log("total warnings found: " + this.id_ans[this.token].length);
            res({ans: this.id_ans[this.token], fdata: fdata, sdata: sdata});
        })
        
    }
}

