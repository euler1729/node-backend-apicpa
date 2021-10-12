module.exports = class CPACountryGraph {
    constructor(id_success, id_ans) {
        this.id_success = id_success;
        this.id_ans = id_ans;
        this.General = require("./general.js");
        this.general = new this.General();
        this.color = [
            '#F44336',
            '#FFEBEE',
            '#FFCDD2',
            '#EF9A9A',
            '#E57373',
            '#EF5350',
            '#E53935',
            '#D32F2F',
            '#C62828',
            '#B71C1C',
            '#FF8A80',
            '#FF5252',
            '#FF1744',
            '#D50000',
            '#FCE4EC',
            '#F8BBD0',
            '#F48FB1',
            '#F06292',
            '#EC407A',
            '#E91E63',
            '#D81B60',
            '#C2185B',
            '#AD1457',
            '#880E4F',
            '#FF80AB',
            '#FF4081',
            '#F50057',
            '#C51162',
            '#F3E5F5',
            '#E1BEE7',
            '#CE93D8',
            '#BA68C8',
            '#AB47BC',
            '#9C27B0',
            '#8E24AA',
            '#7B1FA2',
            '#6A1B9A',
            '#4A148C',
            '#EA80FC',
            '#E040FB',
            '#D500F9',
            '#AA00FF',
            '#EDE7F6',
            '#D1C4E9',
            '#B39DDB',
            '#9575CD',
            '#7E57C2',
            '#673AB7',
            '#5E35B1',
            '#512DA8',
            '#4527A0',
            '#311B92',
            '#B388FF',
            '#7C4DFF',
            '#651FFF',
            '#6200EA',
            '#E8EAF6',
            '#C5CAE9',
            '#9FA8DA',
            '#7986CB',
            '#5C6BC0',
            '#3F51B5',
            '#3949AB',
            '#303F9F',
            '#283593',
            '#1A237E',
            '#8C9EFF',
            '#536DFE',
            '#3D5AFE',
            '#304FFE',
            '#E3F2FD',
            '#BBDEFB',
            '#90CAF9',
            '#64B5F6',
            '#42A5F5',
            '#2196F3',
            '#1E88E5',
            '#1976D2',
            '#1565C0',
            '#0D47A1',
            '#82B1FF',
            '#448AFF',
            '#2979FF',
            '#2962FF',
            '#E1F5FE',
            '#B3E5FC',
            '#81D4FA',
            '#4FC3F7',
            '#29B6F6',
            '#03A9F4',
            '#039BE5',
            '#0288D1',
            '#0277BD',
            '#01579B',
            '#80D8FF',
            '#40C4FF',
            '#00B0FF',
            '#0091EA',
            '#E0F7FA',
            '#B2EBF2',
            '#80DEEA',
            '#4DD0E1',
            '#26C6DA',
            '#00BCD4',
            '#00ACC1',
            '#0097A7',
            '#00838F',
            '#6064',
            '#84FFFF',
            '#18FFFF',
            '#00E5FF',
            '#00B8D4',
            '#E0F2F1',
            '#B2DFDB',
            '#80CBC4',
            '#4DB6AC',
            '#26A69A',
            '#9688',
            '#00897B',
            '#00796B',
            '#00695C',
            '#004D40',
            '#A7FFEB',
            '#64FFDA',
            '#1DE9B6',
            '#00BFA5',
            '#E8F5E9',
            '#C8E6C9',
            '#A5D6A7',
            '#81C784',
            '#66BB6A',
            '#4CAF50',
            '#43A047',
            '#388E3C',
            '#2E7D32',
            '#1B5E20',
            '#B9F6CA',
            '#69F0AE',
            '#00E676',
            '#00C853',
            '#F1F8E9',
            '#DCEDC8',
            '#C5E1A5',
            '#AED581',
            '#9CCC65',
            '#8BC34A',
            '#7CB342',
            '#689F38',
            '#558B2F',
            '#33691E',
            '#CCFF90',
            '#B2FF59',
            '#76FF03',
            '#64DD17',
            '#F9FBE7',
            '#F0F4C3',
            '#E6EE9C',
            '#DCE775',
            '#D4E157',
            '#CDDC39',
            '#C0CA33',
            '#AFB42B',
            '#9E9D24',
            '#827717',
            '#F4FF81',
            '#EEFF41',
            '#C6FF00',
            '#AEEA00',
            '#FFFDE7',
            '#FFF9C4',
            '#FFF59D',
            '#FFF176',
            '#FFEE58',
            '#FFEB3B',
            '#FDD835',
            '#FBC02D',
            '#F9A825',
            '#F57F17',
            '#FFFF8D',
            '#FFFF00',
            '#FFEA00',
            '#FFD600',
            '#FFF8E1',
            '#FFECB3',
            '#FFE082',
            '#FFD54F',
            '#FFCA28',
            '#FFC107',
            '#FFB300',
            '#FFA000',
            '#FF8F00',
            '#FF6F00',
            '#FFE57F',
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
            '#CFD8DC',
            '#B0BEC5',
            '#90A4AE',
            '#78909C',
            '#607D8B',
            '#546E7A',
            '#455A64',
            '#37474F',
            '#263238',
            '#0',
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