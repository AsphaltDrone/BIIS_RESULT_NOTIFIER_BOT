var swaps = new Array;
var trigs = new Array;

function Complex(re, im) {
    this.re = re;
    this.im = im;

}
Complex.prototype.switchit = cswitchit;
Complex.prototype.fourier = cfourier;
Complex.prototype.multiply = cmultiply;
Complex.prototype.multiply1 = cmultiply1;
Complex.prototype.plus = cplus;
Complex.prototype.plus2 = cplus2;
Complex.prototype.minus = cminus;
Complex.prototype.minus2 = cminus2;
Complex.prototype.addconjugate2 = caddconjugate2;
Complex.prototype.minusconjugate2 = cminusconjugate2;
Complex.prototype.conjugate = cconjugate;
Complex.prototype.realmultiply = crealmultiply;
Complex.prototype.imaginarymultiply = cimaginarymultiply;
Complex.prototype.trigometricincrement = ctrigometricincrement;
Complex.prototype.trigometricincrement2 = ctrigometricincrement2;
Complex.prototype.equal = cequal;



function cswitchit(switcher) {

    var temp;
    temp = switcher.re;
    switcher.re = this.re;
    this.re = temp;

    temp = switcher.im;
    switcher.im = this.im;
    this.im = temp;
}
var wm = new Complex(0.0, 0.0);

function cfourier(odd, w) {
    wm.multiply(odd, w);
    odd.minus2(this, wm);
    this.plus(wm);
}


function cmultiply(b, w) {

    this.re = w.re * b.re - w.im * b.im;
    this.im = w.re * b.im + w.im * b.re;
}
function cmultiply1(a) {
    var re, im;
    re = this.re * a.re - this.im * a.im;
    im = this.re * a.im + this.im * a.re;
    this.re = re;
    this.im = im;
}
function cplus(b) {
    this.re += b.re;
    this.im += b.im;
}
function cplus2(a, b) {
    this.re = a.re + b.re;
    this.im = a.im + b.im;
}

function cminus(b) {
    this.re -= b.re;
    this.im -= b.im;
}
function cminus2(a, b) {
    this.re = a.re - b.re;
    this.im = a.im - b.im;
}
function ctrigometricincrement(wp) {
    var temp;
    temp = this.re;
    this.re -= this.re * wp.re + this.im * wp.im;
    this.im += temp * wp.im - this.im * wp.re;
}
function ctrigometricincrement2(a, wp) {
    this.re = a.re - (a.re * wp.re + a.im * wp.im);
    this.im = a.im + (a.re * wp.im - a.im * wp.re);
}

function crealmultiply(real) {
    this.re *= real;
    this.im *= real;
}
function cimaginarymultiply(im) {
    var temp = this.re;
    this.re = -1 * (this.im * im);
    this.im = temp * im;
}
function caddconjugate2(a, b) {
    this.re = a.re + b.re;
    this.im = a.im - b.im;
}
function cminusconjugate2(a, b) {
    this.re = a.re - b.re;
    this.im = a.im + b.im;
}
function cconjugate() {
    this.im = - this.im;
}
function cequal(a) {
    this.re = a.re;
    this.im = a.im;
}
var unwindX = new Complex(0.0, 0.0);
var unwindY = new Complex(0.0, 0.0);
function unwindreal(complexesI, complexesJ, even, odd, w) {
    unwindX.addconjugate2(complexesI, complexesJ);
    unwindX.realmultiply(even);
    unwindY.minusconjugate2(complexesI, complexesJ);
    unwindY.imaginarymultiply(odd);
    unwindY.multiply1(w);
    complexesI.minus2(unwindX, unwindY);
    complexesJ.plus2(unwindX, unwindY);
    complexesJ.conjugate();
}



function fourier2(complexesA, complexesB, size, direction) {
    var binlength, bin, j, binincrement, i, k, temp, theta, bitreverse, length, temp, trigmultiplier;

    if (typeof (swaps[size]) == "undefined") {
        swaps[size] = new Array(size);
        for (i = 0; i < size; i++, bitreverse = 0, length = size / 2, j = i) {
            while (length > 0) {
                if (j % 2 == 1)
                    bitreverse += length;
                j >>= 1;
                length >>= 1;
            }
            swaps[size][i] = bitreverse;
        }
    }
    for (i = 0; i < size; i++) {
        try {
            index = swaps[size][i];
        } catch (e) {
            swaps[size] = new Array(size);
            for (i = 0; i < size; i++, bitreverse = 0, length = size / 2, j = i) {
                while (length > 0) {
                    if (j % 2 == 1)
                        bitreverse += length;
                    j >>= 1;
                    length >>= 1;
                }
                swaps[size][i] = bitreverse;
            }
        }
        if (index > i) {
            complexesA[i].switchit(complexesA[index]);
            if (complexesB != null)
                complexesB[i].switchit(complexesB[index]);
        }
        index = swaps[size][i];
    }


    if (typeof trigs[size * direction] == "undefined") {
        var wp = new Complex(0.0, 0.0);
        theta = direction * (6.28318530717959 / size);
        temp = Math.sin(0.5 * theta);

        wp.re = 2.0 * temp * temp;
        wp.im = Math.sin(theta);
        var warray = new Array(size / 2);

        warray[0] = new Complex(1.0, 0.0);
        for (k = 1; k < size / 2; k++) {
            warray[k] = new Complex(0.0, 0.0);
            warray[k].trigometricincrement2(warray[k - 1], wp);
        }
        trigs[size * direction] = warray;

    }

    var warray = trigs[size * direction];

    for (binlength = 1, trigmultiplier = size / 2; binlength < size; binlength *= 2, trigmultiplier /= 2) {

        for (bin = 0; bin < size; bin += binlength * 2)
            for (i = bin, j = bin + binlength, k = 0; i < bin + binlength; i++, j++, k += trigmultiplier) {
                complexesA[i].fourier(complexesA[j], warray[k]);
                if (complexesB != null)
                    complexesB[i].fourier(complexesB[j], warray[k]);
            }

    }


}

function fouriermultiply(c, d, sizec) {

    var i, j, k, sized = sizec, fouriersize = 1, sizecd, cstart = 0, dstart = 0, carry, temp, cf, df;

    for (i = 0; i < sizec; i++)
        if (c[i] == 0)
            cstart++;
        else break;
    if (cstart % 2 == 1)
        cstart--;
    for (i = 0; i < sized; i++)
        if (d[i] == 0)
            dstart++;
        else break;
    if (dstart % 2 == 1)
        dstart--;



    var product = new Array(sizec + sized);

    var sizecd = ((sized - dstart) + (sizec - cstart)) / 2



    while (fouriersize < sizecd) fouriersize *= 2;

    cf = new Array(fouriersize);
    df = new Array(fouriersize);


    for (j = 0, i = cstart; i < sizec; j++, i += 2)
        cf[j] = new Complex(c[i], c[i + 1]);


    for (; j <= fouriersize; j++)
        cf[j] = new Complex(0.0, 0.0);

    for (j = 0, i = dstart; i < sized; j++, i += 2)
        df[j] = new Complex(d[i], d[i + 1]);

    for (; j <= fouriersize; j++)
        df[j] = new Complex(0.0, 0.0);

    convolution(df, cf, fouriersize);

    carry = 0.0;

    var maxx = 256.0 * 256.0;
    var leastsignificant = sizec + sized;
    var leastsignificantfourier = sizecd;
    var placein = false;



    k = leastsignificant;

    for (j = fouriersize - 1;
        j >= 0;
        j--) {
        if (!placein && j < leastsignificantfourier)
            placein = true;

        temp = df[j].im + carry + 0.5;
        carry = Math.floor(temp / maxx)
        if (placein)
            product[k--] = Math.floor(temp - carry * maxx);

        temp = df[j].re + carry + 0.5
        carry = Math.floor(temp / maxx);
        if (placein)
            product[k--] = Math.floor(temp - carry * maxx);
    }
    product[k--] = Math.floor(carry);
    for (; k >= 0; k--)
        product[k] = 0.0;

    if (carry >= maxx) alert("an error has occured in multiply");


    return product;

}

function convolution(complexesA, complexesB, size) {
    var i, j, temp, even = 0.5, odd = 0.5, theta;
    var cached = "rr" + size;
    var cachedinverse = "rr" + (-size);
    var debug = false;

    theta = (3.141592653589793 / size);

    fourier2(complexesA, complexesB, size, 1);

    if (typeof trigs[cached] == "undefined") {
        var warray = new Array(size / 2);
        var warrayinverse = new Array(size / 2);
        temp = Math.sin(0.5 * theta);
        var wp = new Complex(2.0 * temp * temp, Math.sin(theta));
        var wpinverse = new Complex(wp.re, -wp.im);

        warray[0] = new Complex(1.0 - wp.re, wp.im);
        warrayinverse[0] = new Complex(1.0 - wpinverse.re, wpinverse.im);
        for (k = 1; k < size / 2; k++) {
            warray[k] = new Complex(0.0, 0.0);
            warray[k].trigometricincrement2(warray[k - 1], wp);
            warrayinverse[k] = new Complex(0.0, 0.0);
            warrayinverse[k].trigometricincrement2(warrayinverse[k - 1], wpinverse);
        }
        trigs[cached] = warray;
        trigs[cachedinverse] = warrayinverse;

    }

    var warray = trigs[cached];
    var warrayinverse = trigs[cachedinverse];


    var x = new Complex(0.0, 0.0);
    var y = new Complex(0.0, 0.0);


    for (i = size / 2 - 1, j = size / 2 + 1; i > 0; i--, j++) {
        unwindreal(complexesA[i], complexesA[j], even, odd, warray[i - 1]);
        unwindreal(complexesB[i], complexesB[j], even, odd, warray[i - 1]);
        complexesA[i].multiply1(complexesB[i]);
        complexesA[j].multiply1(complexesB[j]);
        unwindreal(complexesA[i], complexesA[j], even, -odd, warrayinverse[i - 1]);
    }
    complexesA[size / 2].multiply1(complexesB[size / 2]);

    // do f(0) and f(n/2) frequencies
    // f(0) = f(n/2)
    var xtemp = new Complex(0.0, 0.0), ytemp = new Complex(0.0, 0.0);
    var nw = new Complex(1.0, 0.0);
    xtemp.equal(complexesA[0]);
    ytemp.equal(complexesA[0]);
    unwindreal(xtemp, ytemp, even, odd, nw);

    complexesA[0].re = xtemp.re;
    complexesA[0].im = ytemp.re;

    xtemp.equal(complexesB[0]);
    ytemp.equal(complexesB[0]);
    unwindreal(xtemp, ytemp, even, odd, nw);
    complexesB[0].re = xtemp.re;
    complexesB[0].im = ytemp.re;

    complexesA[0].re *= complexesB[0].re;
    complexesA[0].im *= complexesB[0].im;

    xtemp.equal(complexesA[0]);
    ytemp.equal(complexesA[0]);
    unwindreal(xtemp, ytemp, even, -odd, nw);
    complexesA[0].im = xtemp.re / 2;
    complexesA[0].re = ytemp.re / 2;

    fourier2(complexesA, null, size, -1);

    // normalize
    for (i = 0; i < size; i++) {
        complexesA[i].re /= size;
        complexesA[i].im /= size;
    }


}


function intonum(str1) {
    var size = 16;//SCnumbersize;
    var bignum = new Array();
    var i, j;
    var debug = 0;
    var oddlength = 0;
    var str;

    str = str1;

    var randomString = "";
    var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+=:;";
    var i;

    var randomString = "";
    if (false)
        for (i = 0; i < 8; i++)
            randomString += alphabet.charAt(Math.floor(Math.random() * 78));

    str = randomString + str;


    for (i = 0; i < size; i++)
        bignum[i] = 0;

    for (j = size - 1, i = str.length - 2; j >= 0 && i >= 0; i -= 2, j--) {
        bignum[j] = str.charCodeAt(i) * 256 +
            str.charCodeAt(i + 1);

    }
    // put in eight random numbers

    // if odd length

    if (str.length % 2 == 1 && j > 0) {
        bignum[j] = str.charCodeAt(0);
        j--;
    }

    return bignum;

}

function hexnum(st) {
    var size = 16; //SCnumbersize;
    var bignum = new Array();
    var i, j;
    var debug = 0;
    var hexchars = "0123456789abcdef";
    var zeros = "";
    var stri = "";
    var pads = 0;

    for (i = 0; i < size; i++)
        bignum[i] = 0;

    pads = (st.length) % 4;

    if (pads != 0) {
        zero = "";
        while (pads-- > 0) {
            zero += "0";
        }
        stri = zero + st;
    }
    else stri = st;


    for (j = size - 1, i = stri.length - 4; j >= 0 && i >= 0; i -= 4, j--) {
        bignum[j] = (hexchars.indexOf(stri.substring(i, i + 1)) * 16 +
            hexchars.indexOf(stri.substring(i + 1, i + 2))) * 256 +
            hexchars.indexOf(stri.substring(i + 2, i + 3)) * 16 +
            hexchars.indexOf(stri.substring(i + 3, i + 4));
    }
    return bignum;

}

function zeronum(size) {

    var bignum = new Array();
    var i;
    for (i = 0; i < size; i++)
        bignum[i] = 0;
    return bignum;
}

function lowtrunc(bignum, size) {

    var i = size / 2;
    var j, k;
    var retnum = zeronum(i);

    for (k = 0, j = i; j < size; j++, k++) {
        retnum[k] = bignum[j];

    }

    //  alert("here retnum "+retnum);   
    return retnum;
}

function fractrunc(bignum, size) {
    var i = size / 2;
    var j, k;
    var retnum = zeronum(i);
    for (j = 1; j < i + 1; j++)
        retnum[j - 1] = bignum[j];
    return retnum;
}

function equal(bignum1, bignum2, size) {
    var i, j;
    var debug = 0;
    for (i = 0; i < size; i++) {
        if (bignum1[i] != bignum2[i])
            return 0;
    }
    return 1;
}

function copynum(bignum, size) {
    var i;
    var retnum = new Array()
    for (i = 0; i < size; i++)
        retnum[i] = bignum[i];
    return retnum;
}

var SCmaxxx = 256 * 256;

function minus(bignum1, bignum2, size) {
    var i;
    var c = 0;
    //var maxx = 256*256-1;
    var debug = 0;

    for (i = size - 1; i >= 0; i--) {
        if (bignum1[i] >= (bignum2[i] + c)) {
            bignum1[i] -= (bignum2[i] + c);
            c = 0;
        }
        else {
            bignum1[i] += SCmaxxx;
            bignum1[i] -= (bignum2[i] + c);
            c = 1;
        }

    }

    // could have carry before beginning of big number.
    return bignum1;

}

var SCdofouriermultiply = true;
var SCproduction = false;

function multiply(a, b, size) {

    if (SCdofouriermultiply)
        return fouriermultiply(a, b, size);
    else return nsquaredmultiply(a, b, size);

}

function nsquaredmultiply(bignum1, bignum2, size) {
    var i, j, k, uv, c;
    var result = zeronum(2 * size);
    var maxx = 256 * 256 - 1;
    var maxxx = 256 * 256;
    var debug = 0;

    for (i = 0; i < size; i++)
        if (bignum1[i] != 0)
            break;
    if (i == size)
        return result;

    var endi = i - 1;
    if (endi < 0)
        endi = 0;

    for (j = 0; j < size; j++)
        if (bignum2[j] != 0)
            break;
    if (j == size)
        return result;

    var endj = j - 2;
    if (endj < 0)
        endj = 0;

    for (i = size - 1; i >= endi; i--) {
        c = 0;
        k = size + i;
        for (j = size - 1; j >= endj; j--, k--) {
            uv = result[k] + bignum1[i] * bignum2[j] + c;
            result[k] = uv & maxx;
            c = Math.floor(uv / maxxx);
        }
        result[k] = c;
    }
    return result;
}

function inverse(bignum1, size, inversesize) {
    // get an initial approximation by floats

    var i, j, adds = 4, temp;
    //var maxx=256*256;
    var bignuminv, oldtwo, two = zeronum(size + 2);


    // increase size of all numbers by 4
    var bignum = zeronum(size + adds);



    for (i = adds, j = 0; i < size + adds; i++, j++)
        bignum[i] = bignum1[j];
    size += adds;


    var inv = zeronum(size);
    var startc = 0;
    for (i = 0; i < size; i++)
        if (bignum[i] == 0)
            startc++;
        else break;
    var reciprocal1 = Math.floor((1 / bignum[startc]) * 256 * 256 * 256 * 256);

    inv[size / 2 - 1] = reciprocal1;


    //alert("here multiply "+(multiply(bignum,inv,size)).length);

    // u_i+1 = u_i(2-u_i*v) -- newton's method to inverse a number


    for (i = 0; i < size; i++)  // just to limit the loop
    {

        bignuminv = lowtrunc(multiply(bignum, inv, size), size * 2);

        oldtwo = copynum(two, size);
        for (j = 0; j < size; j++)
            two[j] = 0;
        two[0] = 2;

        minus(two, bignuminv, size);
        inv = fractrunc(multiply(inv, two, size), size * 2);

        if (equal(two, oldtwo, size) == 1)
            break;
    }

    // the first element is the integer component, get rid of it
    for (j = 0; j < size - adds; j++) {
        inv[j] = inv[j + 1];
    }

    return inv;
}

function modulusinverse(modulus, size) {
    var m = zeronum(size * 2);
    var i, j, k;
    var debug = 0;

    for (j = 0, i = size; i < size * 2; i++, j++)
        m[i] = modulus[j];


    var invert = inverse(m, size * 2, size * 2);
    return invert;
}

function tohex1(bignum, size) {
    var i, j;
    var high;
    var low;
    var one, two;
    var hexnumbers = "0123456789abcdef";
    var result = "";
    var trunc = 0;
    if (trunc == 1) {
        for (i = 0; i < size; i++)
            if (bignum[i] != 0)
                break;
        if (i == size)
            return "00";
    }
    else i = 0;
    for (; i < size; i++) {
        high = Math.floor(bignum[i] / 256);
        low = bignum[i] % 256;
        one = Math.floor(high / 16);
        two = high % 16;
        result += hexnumbers.substring(one, one + 1) + hexnumbers.substring(two, two + 1);
        one = Math.floor(low / 16);
        two = low % 16;
        result += hexnumbers.substring(one, one + 1) + hexnumbers.substring(two, two + 1);
    }
    // strip beginning zeros off number
    for (i = 0; i < result.length; i++)
        if (result.charAt(i) != '0')
            break;
    if (i == result.length)
        return ("00");
    else result = result.substr(i, result.length);

    return result;
}

function comparezero(bignum, size) {
    var i;
    var debug = 0;
    for (i = size - 1; i >= 0; i--) {
        if (bignum[i] != 0)
            return 0;
    }
    return 1;
}

function shiftright(bignum, size) {
    var i;
    var c = 0;
    var maxx = (SCmaxxx) / 2;
    var debug = 0;
    for (i = size - 1; i >= 0; i--) {
        bignum[i] = Math.floor(bignum[i] / 2);
        if (i - 1 >= 0) {
            if ((bignum[i - 1] & 1) == 1)
                bignum[i] += maxx;
        }
    }
}

function thesize(bignum, size) {
    var i;
    for (i = 0; i < size; i++)
        if (bignum[i] != 0)
            return size - i;
    return size;
}

function hightrunc(bignum, size) {
    var i = size / 2;
    var j, k;
    var retnum = zeronum(i);
    for (j = 0; j < i; j++)
        retnum[j] = bignum[j];
    return retnum;
}

function remainderwithinverse(bignum1, bignum2, size, invert) {
    var debug = 0;
    var i, j;
    var s1 = thesize(bignum1, size);
    var s2 = thesize(bignum2, size);
    var retnum = copynum(bignum1, size);
    // if bignum1 less than the modulus

    if (s1 < s2)
        return retnum;

    var quotient = hightrunc(multiply(invert, bignum1, size), size * 2);
    var remainder = lowtrunc(multiply(bignum2, quotient, size), size * 2);
    minus(retnum, remainder, size);
    return retnum;  // return remainder, quotient is uninteresting

}

function modpowwithinverse(message, exponent, modulus, invert, size) {
    var r = zeronum(size);
    r[size - 1] = 1;
    var s = copynum(message, size);
    var e = copynum(exponent, size);
    var m = zeronum(size * 2);
    var i, j, k;
    var debug = 0;
    var odd = 0;

    var atime, thetime;

    atime = new Date;
    thetime = atime.getTime();

    for (j = 0, i = size; i < size * 2; i++, j++)
        m[i] = modulus[j];

    while (comparezero(e, size) == 0) {
        odd = e[size - 1] & 1;
        shiftright(e, size);
        if (odd == 1) {
            r = multiply(r, s, size);
            r = remainderwithinverse(r, m, size * 2, invert);
            r = lowtrunc(r, size * 2);
        }
        s = multiply(s, s, size);
        s = remainderwithinverse(s, m, size * 2, invert);
        s = lowtrunc(s, size * 2);

    }
    return r;
}


function jsrsaenc(key, mod, keylen, pass) {

    var ekey = key;
    var modulus = mod;
    var rsakeylength = keylen;
    var SCnumbersize = rsakeylength / 16;

    var message = intonum(pass);
    var e = hexnum(ekey);
    var m = hexnum(modulus);
    var ModInverse = modulusinverse(hexnum(modulus), SCnumbersize);
    pass = tohex1(modpowwithinverse(message, e, m, ModInverse, SCnumbersize), SCnumbersize);
    
    return pass;

}

module.exports = { jsrsaenc };