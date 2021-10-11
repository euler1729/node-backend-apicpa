module.exports=class CPAGraph{
    constructor(id_success, id_ans){
        this.id_success=id_success;
        this.id_ans=id_ans
        this.General=require('./general.js');
        this.general=new this.General();
    }

    setToken(token){
        this.token=token
    }

    compress(datalist){
        let brr=[];
        for(let i=0; i<datalist.length; i++)
            for(let row of datalist[i]){
                const pushObj=brr.find(obj=>obj.date===row.date&&obj.bundleId===row.bundleId);
                if(!pushObj){
                    brr.push({
                        date: row.date,
                        bundleId: row.bundleId,
                        install: parseInt(row.install),
                        spend: parseFloat(row.spend)
                    })
                }
                else {
                    pushObj.install += parseInt(row.install);
                    pushObj.spend += parseFloat(row.spend);
                }
            }
        brr.sort((a, b)=>a.date>b.date?1:-1);
        return new Promise((res, rej)=>{
            // console.log(brr);
            res(brr);
        })
    }

    datagen(arr){
        const color = [
            "#FF7F50", "#DE3163", "#000000", "#FF0000",	"#800000", "#FFFF00", "#808000", "#00FF00 ", "#008000 ", "#00FFFF", "#008080",
            "#0000FF", "#000080", "#FF00FF", "#800080", "#CD5C5C"];
        let brr={
            labels:[],
            datasets:[]
        };

        brr.labels=this.dateList;

        for(let i=0; i<arr.length; i++){

            const pushobj = brr.datasets.find(obj=>obj.label===arr[i].bundleId);
            if(!pushobj) {
                if(arr[i].date !== this.dateList[0]){
                    brr.datasets.push({
                        label: arr[i].bundleId,
                        data: [0],
                        borderColor: color[brr.datasets.length-1],
                        backgroundColor: color[brr.datasets.length-1],
                        tension: 0.5,
                        borderWidth:1,
                    })
                    for(let j=1; j<this.dateList.length && arr[i].date !== this.dateList[j]; j++) 
                        brr.datasets[brr.datasets.length-1].data.push(0);
                    brr.datasets[brr.datasets.length-1].data.push(
                        arr[i].install?arr[i].spend/parseFloat(arr[i].install):0
                    );
                }
                else brr.datasets.push({
                    label:arr[i].bundleId,
                    data: [arr[i].install?arr[i].spend/parseFloat(arr[i].install):0],
                    borderColor: color[brr.datasets.length-1],
                    backgroundColor: color[brr.datasets.length-1],
                    tension: 0.5,
                    borderWidth:1,
                });
            }
            else {
                const days = this.dateList.findIndex(obj=>obj===arr[i].day);
                while(pushobj.data.length < days) pushobj.data.push(0);
                pushobj.data.push(arr[i].install?arr[i].spend/parseFloat(arr[i].install):0);
            }

        }
        return new Promise((res, rej)=>{
            res(brr);
        })
    }

    async fetcher(source_params){

        const mint_data=await this.general.mintegral(source_params,  (arr)=>{
            // console.log(arr);
            const brr=[];
            for(let i=0; i<arr.length-1; i++){
                let pushObj=brr.find(obj=>((obj.date===arr[i].date)&&(obj.bundleId===arr[i].package_name)))
                if(!pushObj){
                    brr.push({
                        date: arr[i].date,
                        bundleId: arr[i].package_name,
                        install: arr[i].install,
                        spend: arr[i].spend
                    })
                }
                else {
                    pushObj.install += parseInt(arr[i].install);
                    pushObj.spend += parseFloat(arr[i].spend);
                }
            }
            return brr;
        })

        const is_data=await this.general.is(source_params, (arr)=>{
            // console.log(arr);
            const brr=[];
            for(let i in arr){
                brr.push({
                    date: arr[i].date.slice(0, 10),
                    bundleId: arr[i].titleBundleId,
                    install: arr[i].installs,
                    spend: arr[i].spend
                })
            }
            return brr;
        })

        const applovin_data=await this.general.applovin(source_params, (arr)=>{
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

        let now = Date.now();
        now = now-now%this.general.dayToMs(1)-this.general.dayToMs(1);

        this.dateList=await this.general.dateList({
            start: now-this.general.dayToMs(source_params.range-1),
            end: now
        })
        const compress_data=await this.compress([mint_data, is_data, applovin_data])
        const ans=await this.datagen(compress_data);

        this.id_success[this.token]=true;
        this.id_ans[this.token]=ans;
        return [mint_data, is_data, applovin_data];
    }
}