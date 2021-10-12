module.exports=class CPAGraph{
    constructor(id_success, id_ans){
        this.id_success=id_success;
        this.id_ans=id_ans
        this.General=require('./general.js');
        this.general=new this.General();
        this.apiList=['mintegral', 'ironSource', 'applovin', 'unity']
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

    datagen_main(arr){
        const color = [
            '#FFD740',
            '#FFC400',
            '#FFAB00',
            '#FFF3E0',
            '#FFE0B2',
            '#FFCC80',
            '#FFB74D',
            '#FFA726',
            '#FF9800',
            '#FB8C00',
            '#F57C00',
            '#EF6C00',
            '#E65100',
            '#FFD180',
            '#FFAB40',
            '#FF9100',
            '#FF6D00',
            '#FBE9E7',
            '#FFCCBC',
            '#FFAB91',
            '#FF8A65',
            '#FF7043',
            '#FF5722',
            '#F4511E',
            '#E64A19',
            '#D84315',
            '#BF360C',
            '#FF9E80',
            '#FF6E40',
            '#FF3D00',
            '#DD2C00',
            '#EFEBE9',
            '#D7CCC8',
            '#BCAAA4',
            '#A1887F',
            '#8D6E63',
            '#795548',
            '#6D4C41',
            '#5D4037',
            '#4E342E',
            '#3E2723',
            '#FAFAFA',
            '#F5F5F5',
            '#EEEEEE',
            '#E0E0E0',
            '#BDBDBD',
            '#9E9E9E',
            '#757575',
            '#616161',
            '#424242',
            '#212121',
            '#ECEFF1',
            '#CFD8DC',];
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

    datagen_subsequent(dataList){
        const color = [
            '#FFD740',
            '#FFC400',
            '#FFAB00',
            '#FFF3E0',
            '#FFE0B2',
            '#FFCC80',
            '#FFB74D',
            '#FFA726',
            '#FF9800',
            '#FB8C00',
            '#F57C00',
            '#EF6C00',
            '#E65100',
            '#FFD180',
            '#FFAB40',
            '#FF9100',
            '#FF6D00',
            '#FBE9E7',
            '#FFCCBC',
            '#FFAB91',
            '#FF8A65',
            '#FF7043',
            '#FF5722',
            '#F4511E',
            '#E64A19',
            '#D84315',
            '#BF360C',
            '#FF9E80',
            '#FF6E40',
            '#FF3D00',
            '#DD2C00',
            '#EFEBE9',
            '#D7CCC8',
            '#BCAAA4',
            '#A1887F',
            '#8D6E63',
            '#795548',
            '#6D4C41',
            '#5D4037',
            '#4E342E',
            '#3E2723',
            '#FAFAFA',
            '#F5F5F5',
            '#EEEEEE',
            '#E0E0E0',
            '#BDBDBD',
            '#9E9E9E',
            '#757575',
            '#616161',
            '#424242',
            '#212121',
            '#ECEFF1',
            '#CFD8DC',];
        let brr=[];
        brr.push({
            title: "cpa_graph",
            labels: this.dateList,
            datasets: []
        })
        for(let i=0; i<dataList.length; i++){
            for(let row of dataList[i]){
                let chart=brr.find(obj=>obj.title===row.bundleId);
                if(!chart){
                    const pushIdx=brr.push({
                        title: row.bundleId,
                        labels: this.dateList,
                        datasets: []
                    })
                    chart=brr[pushIdx-1];
                }
                const pushObj=chart.datasets.find(obj=>obj.label===this.apiList[i]);
                if(!pushObj){
                    if(row.date!==this.dateList[0]){
                        chart.datasets.push({
                            label: this.apiList[i],
                            data: [0],
                            borderColor: color[chart.datasets.length],
                            backgroundColor: color[chart.datasets.length],
                            tension: 0.5,
                            borderWidth:1,
                        })
                        for(let j=1; j<this.dateList.length && row.date!==this.dateList[j]; j++) 
                            chart.datasets[chart.datasets.length-1].data.push(0);
                        chart.datasets[chart.datasets.length-1].data.push(row.install?(row.spend)/parseFloat(row.install):0);                        
                    }
                    else chart.datasets.push({
                        label: this.apiList[i],
                        data: [row.install?(row.spend)/parseFloat(row.install):0],
                        borderColor: color[chart.datasets.length],
                        backgroundColor: color[chart.datasets.length],
                        tension: 0.5,
                        borderWidth:1,
                    })
                }
                else{
                    const idx=this.dateList.findIndex(obj=>obj.date===row.date);
                    while(pushObj.data.length<idx) pushObj.data.push(0);
                    pushObj.data.push(row.install?(row.spend)/parseFloat(row.install):0);
                }
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
        mint_data.sort((a, b)=>a.date>b.date?1:-1);

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
        is_data.sort((a, b)=>a.date>b.date?1:-1);

        const applovin_data=await this.general.applovin(source_params, (arr)=>{
            const brr=[];
            for(let i=0; i<arr.length; i++){
                brr.push({
                    date: arr[i].day,
                    bundleId: arr[i].campaign_package_name,
                    install: parseInt(arr[i].conversions),
                    spend: parseFloat(arr[i].cost)
                })
            }
            return brr;
        })
        applovin_data.sort((a, b)=>a.date>b.date?1:-1);

        const unity_data=await this.general.unity(source_params, (arr)=>{
            //  {
            //     date: '2021-10-10',
            //     'target id': '"500048102"',
            //     'target store id': '"com.fpg.sharkslap"',
            //     'target name': '"Shark Attack 3D"',
            //     installs: '145',
            //     spend: '17.3'
            // },
            let brr=[];
            arr=arr.split('\n');
            arr[0]=arr[0].split(',');
            for(let i=1; i<arr.length-1; i++){
                arr[i]=arr[i].replace(/"/g,"").split(',');
                brr.push({
                    date: arr[i][0].slice(0, 10),
                    bundleId: arr[i][2],
                    install: parseInt(arr[i][4]),
                    spend: parseFloat(arr[i][5])
                })
            }
            return brr;
        })
        unity_data.sort((a, b)=>a.date>b.date?1:-1);

        let now = Date.now();
        now = now-now%this.general.dayToMs(1)-this.general.dayToMs(1);

        this.dateList=await this.general.dateList({
            start: now-this.general.dayToMs(source_params.range-1),
            end: now
        })
        const compress_data=await this.compress([mint_data, is_data, applovin_data, unity_data])
        const ans_one=await this.datagen_main(compress_data);
        const ans_two=await this.datagen_subsequent([mint_data, is_data, applovin_data, unity_data]);

        this.id_success[this.token]=true;
        this.id_ans[this.token]=[ans_one, ans_two];
        return {mine: mint_data,is: is_data,applovin: applovin_data,unity: unity_data};
    }
}