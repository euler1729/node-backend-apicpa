class WarningTable{
    constructor(){
        this.t = "six";
    }
    one(){
        console.log("this in ckas. nice");
    }
    vare = 26;
    two(){
        const vare=9;
        console.log(this.vare);
        console.log(vare);
    }
    three(int){
        vare=int;
    }
}
module.exports=WarningTable;