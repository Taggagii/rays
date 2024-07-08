window.onload = () => {
        const canvas = document.getElementById("canvas");
        /** @type {CanvasRenderingContext2D} */
        const context = canvas.getContext("2d");
        canvas.width = window.innerWidth - 100;
        canvas.height = window.innerHeight - 100;

        const s = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);


        const randomCoord = () => {
                return [
                        Math.floor(Math.random() * canvas.clientWidth - 50) + 25,
                        Math.floor(Math.random() * canvas.clientHeight - 50) + 25
                ];
        }

        // write a function that takes in two lines and outputs if they intersect
        const intersect = (X1, Y1, X2, Y2, X3, Y3, X4, Y4, inverted = false) => {
                // check that there is some X overlap
                if (Math.min(X1, X2) > Math.max(X3, X4)) {
                        return false;
                }

                const XInterval = [Math.max(Math.min(X1, X2), Math.min(X3, X4)), Math.min(Math.max(X1, X2), Math.max(X3, X4))]
                const YInterval = [Math.max(Math.min(Y1, Y2), Math.min(Y3, Y4)), Math.min(Math.max(Y1, Y2), Math.max(Y3, Y4))]

                // get the equations of the lines
                // Ya = Ma * x + Ba
                // Yb = Mb * x + Bb
                const Ma = (Y2 - Y1) / (X2 - X1);
                const Mb = (Y4 - Y3) / (X4 - X3);

                if (Math.abs(Ma) > 100000000 || Math.abs(Mb) > 10000000) {
                        if (!Ma || !Mb) {
                                // intervals must be zero
                                if (XInterval[0] - XInterval[1] || YInterval[0] - YInterval[1]) {
                                        return false
                                }

                                context.beginPath();
                                context.arc(XInterval[0], YInterval[0], 5, 0, 2 * Math.PI, false);
                                context.fill();

                                return true
                        }

                        return intersect(Y1, X1, Y2, X2, Y3, X3, Y4, X4, true)
                }


                const Ba = Y1 - Ma * X1;
                const Bb = Y3 - Mb * X3;

                // if the lines are parallel there cannot be an intersection point (unless they're the same line)
                if (Ma == Mb) {
                        return false;
                }

                // because the lines are not parallel there must be an x such that the equations are equal:
                // Yi = Ma * Xi + Ba = Mb * Xi + Bb
                // Ma * Xi + Ba - Mb * Xi - Bb = 0
                // Xi(Ma - Mb) + Ba - Bb = 0
                // Xi = (Bb - Ba) / (Ma - Mb)
                let Xi = (Bb - Ba) / (Ma - Mb);
                let Yi = Ma * Xi + Ba;

                // this point is goodish currently. but not we need to make sure it lines within the overlap of the X's
                if (Xi < XInterval[0] || Xi > XInterval[1]) {
                        return false;
                }

                if (inverted) {
                        Xi ^= Yi;
                        Yi ^= Xi
                        Xi ^= Yi;
                }

                return [Xi, Yi];
        
        }

        const distance = (X1, Y1, X2, Y2) => {
                return Math.sqrt((X2 - X1) * (X2 - X1) + (Y2 - Y1) * (Y2 - Y1));
        }

        const p = randomCoord();

        canvas.addEventListener('mousemove', (event) => {
                const rect = canvas.getBoundingClientRect();
                
                p[0] = event.x - rect.x;
                p[1] = event.y - rect.y;
        })

        const badLines = []
        n = 5;
        for (let i = 0; i < n; ++i) {
                badLines.push([randomCoord(), randomCoord()])
        }

        const loop = (t) => {
                context.beginPath();
                context.fillStyle = "black"
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fill();


                context.beginPath()
                context.strokeStyle = "white"
                context.fillStyle = "white"
                context.arc(...p, 5, 0, 2 * Math.PI);
                context.fill();

                const lines = []

                for (let angle = 0; angle < 2 * Math.PI; angle += (2 * Math.PI) / 1000) {
                        const s = canvas.width + canvas.height;
                        const line = [p, [p[0] + Math.sin(angle) * s, p[1] + Math.cos(angle) * s]] 
                        lines.push(line)

                        let intersections = []

                        for (let i = 0; i < n; ++i) {
                                const intersection = intersect(...line[0], ...line[1], ...badLines[i][0], ...badLines[i][1])
                                if (intersection) {
                                        intersections.push(intersection)
                                }
                        }


                        if (intersections.length == 0) {         
                                context.beginPath();
                                context.lineWidth = 1;
                                context.moveTo(...line[0]);
                                context.lineTo(...line[1]);
                                context.stroke();
                        } else {
                                let minDist = distance(...p, ...intersections[0])
                                let minIntersection = 0;
                                for (let i = 1; i < intersections.length; ++i) {
                                        let d = distance(...p, ...intersections[i])
                                        if (d < minDist) {
                                                minDist = d;
                                                minIntersection = i;
                                        }
                                }
                                
                                context.beginPath();
                                context.lineWidth = 1;
                                context.moveTo(...p);
                                context.lineTo(...intersections[minIntersection]);
                                context.stroke();

                                
                        }
                        
                        

                }

                for (let i = 0; i < n; ++i) {
                        context.beginPath();
                        context.lineWidth = 5;
                        context.strokeStyle = "blue"
                        context.moveTo(...badLines[i][0]);
                        context.lineTo(...badLines[i][1]);
                        context.stroke();
                }


                requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);

        

        

}