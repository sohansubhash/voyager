                    var PI = Math.PI,
                        sin = Math.sin,
                        cos = Math.cos,
                        tan = Math.tan,
                        asin = Math.asin,
                        atan = Math.atan2,
                        acos = Math.acos,
                        rad = PI / 180,
                        J0 = 0.0009,
                        e = rad * 23.4397,
                        dayMs = 1000 * 60 * 60 * 24,
                        J1970 = 2440588,
                        J2000 = 2451545;
                        lat = 37.8719,
                        lng = -122.2585;


                    function toDays(date) {
                        return toJulian(date) - J2000;
                    }

                    function toJulian(date) {
                        return date.valueOf() / dayMs - 0.5 + J1970;
                    }

                    function julianCycle(d, lw) {
                        return Math.round(d - J0 - lw / (2 * PI));
                    }

                    function approxTransit(Ht, lw, n) {
                        return J0 + (Ht + lw) / (2 * PI) + n;
                    }

                    function solarMeanAnomaly(d) {
                        return rad * (357.5291 + 0.98560028 * d);
                    }

                    function eclipticLongitude(M) {
                        var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
                            P = rad * 102.9372; // perihelion of the Earth
                        return M + C + P + PI;
                    }

                    function declination(l, b) {
                        return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
                    }

                    function solarTransitJ(ds, M, L) {
                        return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
                    }

                    function fromJulian(j) {
                        return new Date((j + 0.5 - J1970) * dayMs);
                    }

                    function getSetJ(h, lw, phi, dec, n, M, L) {

                        var w = hourAngle(h, phi, dec),
                            a = approxTransit(w, lw, n);
                        return solarTransitJ(a, M, L);
                    }

                    function hourAngle(h, phi, d) {
                        return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
                    }

                    var lw = rad * -lng,
                        phi = rad * lat,

                        d = toDays(date),
                        n = julianCycle(d, lw),
                        ds = approxTransit(0, lw, n),

                        M = solarMeanAnomaly(ds),
                        L = eclipticLongitude(M),
                        dec = declination(L, 0),

                        Jnoon = solarTransitJ(ds, M, L),

                        i, len, time, Jset, Jrise;


                    // solarNoon: fromJulian(Jnoon),
                    // nadir: fromJulian(Jnoon - 0.5)


                    time = -0.833;
                    Jset = getSetJ(time * rad, lw, phi, dec, n, M, L);
                    Jrise = Jnoon - (Jset - Jnoon);

                    sunrise = fromJulian(Jrise);
                    sunset = fromJulian(Jset);