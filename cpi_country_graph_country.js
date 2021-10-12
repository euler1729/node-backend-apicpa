module.exports = class CPACountryGraph {
    constructor(id_success, id_ans) {
        this.id_success=id_success;
        this.id_ans=id_ans;
        this.General=require("./general.js");
        this.general=new this.General();
        this.apiList=["mintegral", "ironSource", "applovin", "unity"];
    }

    setToken(token) {
        this.token = token;
    }

    country_list_generator(datalist) {
        const brr = [];           //stores country and spend data. top 5 countries are sent back

        for (let i = 0; i < datalist.length; i++) {
            for (let j = 0; j < datalist[i].length; j++) {
                if (datalist[i][j].country === '') datalist[i][j].country = 'aa';
                const pushObj = brr.find(obj => obj.country === datalist[i][j].country);
                if (!pushObj) {
                    brr.push({
                        country: datalist[i][j].country,
                        spend: parseFloat(datalist[i][j].spend)
                    });
                }
                else pushObj.spend += parseFloat(datalist[i][j].spend);
            }
        }
        brr.sort((a, b) => a.spend < b.spend ? 1 : -1); //descending sort

        const country_list = [];
        for (let i = 0; i < brr.length && i < 5; i++) {
            country_list.push(brr[i].country);
        }
        return new Promise((res, rej) => {
            res(country_list);
        })
    }

    //generates cpi for top five countries graph data;
    datagen(datalist) {
        const brr = [];
        const crr = {};
        brr.push({
            title: "cpa_grpah",
            labels: this.dateList,
            datasets: []
        });
        for (let i=0; i<datalist.length; i++) {
            for (let row of datalist[i]) {
                if (this.country_list.find(obj => obj === row.country)) {

                    let chart=brr.find(obj=>obj.title===row.country);
                    if(!chart){
                        const idx=brr.push({
                            title: row.country,
                            labels: this.dateList,
                            datasets: []
                        })
                        chart=brr[idx-1];
                    }

                    const pushObj = chart.datasets.find(obj => obj.label === this.apiList[i]);
                    if (!pushObj) {
                        if (row.date !== this.dateList[0]) {
                            chart.datasets.push({
                                label: this.apiList[i],
                                data: [0],
                                borderColor: this.general.color[chart.datasets.length],
                                backgroundColor: this.general.color[chart.datasets.length],
                                tension: 0.5,
                                borderWidth: 1,
                            });
                            if (i === '0' || (!crr[row.country])) crr[row.country] = { install: [0], spend: [1] };
                            for (let k = 1; k < this.dateList.length && row.date !== this.dateList[k]; k++) {
                                chart.datasets[chart.datasets.length - 1].data.push(0);
                                if (i === '0' || (!crr[row.country])) {
                                    crr[row.country].install.push(0);
                                    crr[row.country].spend.push(1);
                                }
                            }
                            chart.datasets[chart.datasets.length - 1].data.push(
                                row.install ? (row.spend) / parseFloat(row.install) : 0
                            );
                            if (i === '0' || (!crr[row.country])) {
                                crr[row.country].install.push(parseInt(row.install));
                                crr[row.country].spend.push(parseFloat(row.spend));
                            }
                        }
                        else {
                            chart.datasets.push({
                                label: this.apiList[i],
                                data: [row.install ? (row.spend) / parseFloat(row.install) : 0],
                                borderColor: this.general.color[chart.datasets.length],
                                tension: 0.5,
                                borderWidth: 1,
                            })
                            if (i === '0' || (!crr[row.country])) crr[row.country] = { install: [parseInt(row.install)], spend: [parseFloat(row.spend)] };
                        }
                    }
                    else {
                        const idx = this.dateList.findIndex(obj => obj === row.date);
                        while (pushObj.data.length < idx) {
                            pushObj.data.push(0);
                            crr[row.country].install.push(0);
                            crr[row.country].spend.push(1);
                        }
                        pushObj.data.push(row.install ? (row.spend) / parseFloat(row.install) : 0);
                        if (i === '0' || (!crr[row.country])) {
                            crr[row.country].install.push(parseFloat(row.install));
                            crr[row.country].spend.push(parseInt(row.spend));
                        }
                        else {
                            const idx = this.dateList.findIndex(date => date === row.date);
                            if (crr[row.country].install.length > idx) {
                                crr[row.country].install[idx] += parseInt(row.install);
                                crr[row.country].spend[idx] += parseFloat(row.spend);
                            }
                            else {
                                crr[row.country].install.push(parseInt(row.install));
                                crr[row.country].spend.push(parseFloat(row.spend));
                            }
                        }
                    }
                }
            }
        }
        for (let i = 0; i < this.country_list.length; i++) {
            brr[0].datasets.push({
                label: this.country_list[i],
                data: [],
                borderColor: this.general.color[brr[0].datasets.length],
                tension: 0.5,
                borderWidth: 1,
            })
            for (let j = 0; j < crr[this.country_list[i]].install.length; j++) brr[0].datasets[brr[0].datasets.length - 1].data.push(
                crr[this.country_list[i]].install[j] ? crr[this.country_list[i]].spend[j] / parseFloat(crr[this.country_list[i]].install[j]) : 0
            )
        }
        return new Promise((res, rej) => {
            res(brr);
        })
    }

    async fetcher(source_params) {

        const mint_data = await this.general.mintegral(source_params, (arr) => {
            // console.log(arr);
            const brr = [];
            for (let i = 0; i < arr.length - 1; i++) {
                let pushObj = brr.find(obj => ((obj.date === arr[i].date) && (obj.country === arr[i].location)))
                if (!pushObj) {
                    brr.push({
                        date: arr[i].date,
                        country: arr[i].location,
                        install: arr[i].install,
                        spend: arr[i].spend
                    })
                }
                else {
                    pushObj.install += arr[i].install;
                    pushObj.spend += arr[i].spend;
                }
            }
            return brr;
        })
        mint_data.sort((a, b) => a.date > b.date ? 1 : -1);

        const is_data = await this.general.is(source_params, (arr) => {
            // console.log(arr);
            const brr = [];
            for (let i in arr) {
                brr.push({
                    date: arr[i].date.slice(0, 10),
                    country: arr[i].country.toLowerCase(),
                    install: arr[i].installs,
                    spend: arr[i].spend
                })
            }
            return brr;
        })
        is_data.sort((a, b) => a.date > b.date ? 1 : -1);

        const applovin_data = await this.general.applovin(source_params, (arr) => {
            const brr = [];
            for (let i = 0; i < arr.length; i++) {
                brr.push({
                    date: arr[i].day,
                    country: arr[i].country,
                    install: parseInt(arr[i].conversions),
                    spend: parseFloat(arr[i].cost)
                })
            }
            return brr;
        })
        applovin_data.sort((a, b) => a.date > b.date ? 1 : -1);

        const unity_data=await this.general.unity(source_params, (arr)=>{
        
            let brr=[];
            arr=arr.split('\n');
            arr[0]=arr[0].split(',');
            for(let i=1; i<arr.length-1; i++){
                arr[i]=arr[i].replace(/"/g,"").split(',');
                brr.push({
                    date: arr[i][0].slice(0, 10),
                    country: arr[i][1].toLowerCase(),
                    install: parseInt(arr[i][2]),
                    spend: parseFloat(arr[i][3])
                })
            }
            return brr
        })
        unity_data.sort((a, b)=>a.date>b.date?1:-1);

        let now = Date.now();
        now = now - now % this.general.dayToMs(1) - this.general.dayToMs(1);

        this.dateList = await this.general.dateList({
            start: now - this.general.dayToMs(source_params.range - 1),
            end: now
        })
        this.country_list=await this.country_list_generator([mint_data, is_data, applovin_data, unity_data]);
        const ans=await this.datagen([mint_data, is_data, applovin_data, unity_data]);

        this.id_success[this.token]=true;
        this.id_ans[this.token]=ans;
        return [mint_data, is_data, applovin_data, unity_data];
    }
}