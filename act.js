/**
* Returns x,y coordinates of points around a center.
* @param {array} center [x,y]
* @param {float} angles percentage of circumference for adjacent points (1 == 360); 
* @param {int} iterations Number of points to draw 
* @param {float} length Radius of circle
* @returns Array
*/
const points = (center,angles,iterations = 12,length = 140) => {
    let proportion = Math.log2(angles)*360;
    let vertices = [];
    for (let a = 0; a < iterations; a++) {
        // let trans = Math.floor(a/12);
        let angle = ((a*proportion) -90) * Math.PI/180;  //-90 sets top element to 0;
        let x = center[0] + length * Math.cos(angle);
        let y = center[1] + length * Math.sin(angle);
    vertices.push([x,y]);
    }
    return vertices;
}

/**
 * Hilarious.
 * @param {number} value 
 * @returns 
 */
const nearestHundred = (value) => {
    let float = value/100;
    return Math.round(float)*100;
}

/**
 * 
 * @param {string} parent 
 */
function Manager (parent = 'drawing') {
    this.inputData = {
        'iterations': null,
        'ratio': null,
    }
    this.octave = false;
    this.size = {'x': 500,'y': 500};
    this.nodes = {};
    this.parent = document.querySelector(`#${parent}`);
    this.draw = SVG().addTo(this.parent).size(...Object.values(this.size)); 
    /**
     * 
     * @param {float} x 
     * @param {float} y 
     * @param {string} text 
     */
    this.addNode = (x,y,text) => {
        let size = [20,20];
        let grp = this.draw.group();
        let shape = this.draw.circle(...size).center(0,0);
        let tx = this.draw.text(`${text}`).center(0,0);
        grp.add(shape);
        grp.add(tx);
        grp.center(x,y);
        grp['node'].classList.add('Node');
        this.nodes[text] = grp['node'];
    }
    /**
     * Removes all elements from the drawing.
     */
    this.fullClear = () => {
        this.nodes = {};
        document.querySelectorAll('.Node, line').forEach(item => {
            item.remove();
        })
    }
    /**
     * Creates the drawing based on the input values.
     */
    this.fullBuild = () => {
        let its = parseInt(this.inputData['iterations']);
        let rat = this.inputData['ratio'];
        let expanded = document.querySelector('#ratio').value.match(/[0-9]+/ig).map(x => parseInt(x));
        let coords = points([...Object.values(this.size).map(x => x/2)],rat,its,155);
        let tab = document.querySelector('#mini');
        tab.innerHTML = '';
        /**
         * Draws lines first, then paints the nodes over them.
         */
        for (let a = 0; a < its; a++) {
            a > 0? this.draw.line().plot(...coords[a-1],...coords[a]) : null;
        }
        for (let b = 0; b < its; b++) {
            this.addNode(...coords[b],b);
            let row = document.createElement('div');
            row.id = `row${b}`;
            row.classList.add('row')
            let val = ((Math.log2((expanded[0]/expanded[1])**b)*1200)%1200);
            val == 0? this.octave == b : null;//Check for octave! 
            let cont = [`${expanded[0]}:${expanded[1]}<sup>${b}</sup>`,`${val.toFixed(2)}`,`${(val-nearestHundred(val)).toFixed(2)}`];
            for (let c = 0; c < cont.length; c++) {
                let cell = document.createElement('div');
                cell.classList.add('cell');
                cell.innerHTML = cont[c];
                row.appendChild(cell);
            }
            tab.appendChild(row);
        }
        // document.querySelector('#oct').textContent = `Octave: ${this.octave}`;
    }
} 

let full;

document.addEventListener('DOMContentLoaded',() => {
    full = new Manager();
    document.addEventListener('keydown',(event) => {
        if (event.key == 'Enter') {
            document.querySelectorAll('input').forEach(el => {
                if (el.id == 'iterations') {
                    full.inputData['iterations'] = 1+parseInt(el.value.match(/[0-9]+/ig)[0]);
                }
                else if (el.id == 'ratio') {
                    let t = el.value.match(/[0-9]+/ig).map(x => parseInt(x));
                    full.inputData['ratio'] = t[0]/t[1];
                }
                console.table(full.inputData);
                full.fullClear();
                full.octave = false;
                full.inputData['iterations'] !== null && full.inputData['ratio'] !== null? full.fullBuild() : null;
            })
        }
    })
    document.querySelector('#mini').addEventListener('mouseover',(event) => {
        console.log(event.target);
        let targ;
        if (event.target.classList.contains('cell')) {
            targ = event.target.parentNode.id.match(/[0-9]+/ig);
        }
        else {
            targ = event.target.id.match(/[0-9]+/ig);
        }
        console.log(document.querySelectorAll('.Node')[parseInt(targ)])
        let correspondant = document.querySelectorAll('.Node')[parseInt(targ)];//May need parseInt(targ)
        correspondant.classList.add('corr');
    })
    document.querySelector('#mini').addEventListener('mouseout',(event) => {
        document.querySelectorAll('.corr').forEach(item => {
            item.classList.remove('corr');
        })
    })
})