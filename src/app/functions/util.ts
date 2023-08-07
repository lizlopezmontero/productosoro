export const compareDates = (d1: Date, d2: Date, f1: string, f2: string) => {
    let date1 = d1.getTime();
    let date2 = d2.getTime();
  
    if (date1 < date2) {
      //console.log(`${d1} is less than ${d2}`);
      return 1
    } else if (date1 > date2) {
      return -1
    } else {
      const n1 = parseInt(f1);
      const n2 = parseInt(f2);
      if(n1 < n2) return -1;
      if(n1 > n2) return 1;
      return 0
    }
  };

  export const compareDatesSimple = (d1: Date, d2: Date) => {
    let date1 = d1.getTime();
    let date2 = d2.getTime();
  
    if (date1 < date2) {
      //console.log(`${d1} is less than ${d2}`);
      return 1
    } else if (date1 > date2) {
      return -1
    } else {
      return 0
    }
  };

export const zeroPad = function(num: number, numZeros: number) {
  var n = Math.abs(num);
  var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
  var zeroString = Math.pow(10,zeros).toString().substr(1);
  if( num < 0 ) {
      zeroString = '-' + zeroString;
  }
  return zeroString+n;
}

export const makeid = function (length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}