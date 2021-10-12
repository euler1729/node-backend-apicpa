module.exports = class CPACountryGraph {
    constructor(id_success, id_ans) {
        this.id_success = id_success;
        this.id_ans = id_ans;
        this.General = require("./general.js");
        this.general = new this.General();
        this.color = [
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
        for (let i = 0; i < datalist.length + 1; i++) brr.push({ labels: this.dateList, datasets: [] });
        for (let i in datalist) {
            for (let row of datalist[i]) {
                if (this.country_list.find(obj => obj === row.country)) {
                    const pushObj = brr[parseInt(1) + parseInt(i)].datasets.find(obj => obj.label === row.country);
                    if (!pushObj) {
                        if (row.date !== this.dateList[0]) {
                            brr[parseInt(1) + parseInt(i)].datasets.push({
                                label: row.country,
                                data: [0],
                                borderColor: color[brr.datasets.length],
                                backgroundColor: color[brr.datasets.length],
                                tension: 0.5,
                                borderWidth: 1,
                            });
                            if (i === '0' || (!crr[row.country])) crr[row.country] = { install: [0], spend: [1] };
                            for (let k = 1; k < this.dateList.length && row.date !== this.dateList[k]; k++) {
                                brr[parseInt(1) + parseInt(i)].datasets[brr[parseInt(1) + parseInt(i)].datasets.length - 1].data.push(0);
                                if (i === '0' || (!crr[row.country])) {
                                    crr[row.country].install.push(0);
                                    crr[row.country].spend.push(1);
                                }
                            }
                            brr[parseInt(1) + parseInt(i)].datasets[brr[parseInt(1) + parseInt(i)].datasets.length - 1].data.push(
                                row.install ? (row.spend) / parseFloat(row.install) : 0
                            );
                            if (i === '0' || (!crr[row.country])) {
                                crr[row.country].install.push(parseInt(row.install));
                                crr[row.country].spend.push(parseFloat(row.spend));
                            }
                        }
                        else {
                            brr[parseInt(1) + parseInt(i)].datasets.push({
                                label: row.country,
                                data: [row.install ? (row.spend) / parseFloat(row.install) : 0],
                                borderColor: this.color[brr[parseInt(1) + parseInt(i)].datasets.length],
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
                borderColor: this.color[brr[0].datasets.length],
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
                    install: arr[i].conversions,
                    spend: arr[i].cost
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
                    install: arr[i][2],
                    spend: arr[i][3]
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