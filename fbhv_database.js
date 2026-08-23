/**
 * FBHV Database - Fußbodenheizungsverteiler & Verteilerkästen Datenbasis
 * Extrahiert aus FBH_Verteilerkaesten.pdf
 */

const FBHV_DATABASE = {
    // Schrankmodelle & Maße / Artikelnummern
    cabinetModels: {
        'beton_125': {
            id: 'beton_125',
            name: 'metalplast-Stramax Beton-Kasten 125',
            shortName: 'Beton-Kasten 125',
            depth: 125,
            height: '750 - 850 mm',
            type: 'Unterputz (Beton 125 mm)',
            articles: { 'A': '04084.031', 'B': '04084.032', 'C': '04084.033', 'D': '04084.034', 'E': '04084.035' },
            widths: { 'A': 500, 'B': 750, 'C': 900, 'D': 1000, 'E': 1200 },
            footnoteRestriction: 1
        },
        'beton_150': {
            id: 'beton_150',
            name: 'metalplast-Stramax Beton-Kasten 150',
            shortName: 'Beton-Kasten 150',
            depth: 150,
            height: '750 - 850 mm',
            type: 'Unterputz (Beton 150 mm)',
            articles: { 'A': '04084.041', 'B': '04084.042', 'C': '04084.043', 'D': '04084.044', 'E': '04084.045' },
            widths: { 'A': 500, 'B': 750, 'C': 900, 'D': 1000, 'E': 1200 }
        },
        'eps_wand': {
            id: 'eps_wand',
            name: 'metalplast-Stramax EPS-Wand Kasten',
            shortName: 'EPS-Wand Kasten',
            depth: 125,
            height: '750 - 850 mm',
            type: 'Unterputz (EPS-Wand)',
            articles: { 'A': '04084.051', 'B': '04084.052', 'C': '04084.053', 'D': '04084.054', 'E': '04084.055' },
            widths: { 'A': 500, 'B': 750, 'C': 900, 'D': 1000, 'E': 1200 }
        },
        'blech_teleskop': {
            id: 'blech_teleskop',
            name: 'metalplast-Stramax Blech-Teleskopkasten',
            shortName: 'Blech-Teleskopkasten',
            depth: 110,
            height: '750 - 850 mm',
            type: 'Unterputz (Blech-Teleskop)',
            articles: { 'A': '04084.207', 'AA / B': '04084.207', 'B': '04084.207', 'C': '04084.207', 'D': '04084.208', 'E': '04084.208' },
            widths: { 'A': 500, 'AA / B': 600, 'B': 750, 'C': 900, 'D': 1000, 'E': 1200 }
        },
        'stahlblech': {
            id: 'stahlblech',
            name: 'metalplast-Stramax Stahlblechkasten',
            shortName: 'Stahlblechkasten',
            depth: 120,
            height: '650 mm',
            type: 'Aufputz / Unterputz (Stahlblech)',
            articles: { 'A': '04084.201', 'AA / B': '04084.202', 'B': '04084.203', 'C': '04084.204', 'D': '04084.205', 'E': '04084.206' },
            widths: { 'A': 500, 'AA / B': 600, 'B': 750, 'C': 900, 'D': 1000, 'E': 1200 }
        },
        'eps_boden': {
            id: 'eps_boden',
            name: 'metalplast-Stramax EPS-Boden Kasten',
            shortName: 'EPS-Boden Kasten',
            depth: 125,
            height: '200 mm',
            type: 'Bodenkasten (EPS)',
            articles: { 'A': '04084.061', 'B': '04084.062', 'C': '04084.063', 'D': '04084.064' },
            widths: { 'A': 500, 'B': 750, 'C': 900, 'D': 1000 },
            footnoteRestriction: 2
        },
        'klapptuer_weiss': {
            id: 'klapptuer_weiss',
            name: 'metalplast-Stramax Klapptür weiss',
            shortName: 'Klapptür weiss',
            depth: 0,
            height: '750 mm',
            type: 'Zubehör (Fronttür)',
            articles: { 'A': '04084.211', 'AA / B': '04084.212', 'B': '04084.213', 'C': '04084.214', 'D': '04084.215', 'E': '04084.216' },
            widths: { 'A': 500, 'AA / B': 600, 'B': 750, 'C': 900, 'D': 1000, 'E': 1200 }
        }
    },

    // Zuordnung Index -> Mindestbreite in mm
    indexWidthMap: {
        'A': 500,
        'AA / B': 600,
        'B': 750,
        'C': 900,
        'D': 1000,
        'E': 1200
    },

    // Liste aller Anschlusssets mit ihren Auslegungs-Tabellendaten
    connectionSets: [
        // Seite 1
        {
            id: 'kugelhahnset',
            name: 'metalplast Kugelhahnset',
            category: 'Grund-Sets',
            articles: ['51192.107', '51192.108'],
            footnote: 0,
            isWmz: false,
            metalplast: {
                2: { len: 270, index: 'A' },
                3: { len: 320, index: 'A' },
                4: { len: 370, index: 'A' },
                5: { len: 420, index: 'AA / B' },
                6: { len: 470, index: 'AA / B' },
                7: { len: 520, index: 'B' },
                8: { len: 570, index: 'B' },
                9: { len: 620, index: 'B' },
                10: { len: 670, index: 'C' },
                11: { len: 720, index: 'C' },
                12: { len: 770, index: 'C' },
                13: { len: 820, index: 'D' }
            },
            stramax: {
                2: { len: 220, index: 'A' },
                3: { len: 270, index: 'A' },
                4: { len: 320, index: 'A' },
                5: { len: 370, index: 'A' },
                6: { len: 420, index: 'AA / B' },
                7: { len: 470, index: 'AA / B' },
                8: { len: 520, index: 'B' },
                9: { len: 570, index: 'B' },
                10: { len: 620, index: 'B' },
                11: { len: 670, index: 'C' },
                12: { len: 720, index: 'C' }
            }
        },
        {
            id: 'wmz_horiz_mp',
            name: 'metalplast Anschluss-Set WMZ horizontal',
            category: 'WMZ-Sets',
            articles: ['51192.140', '51192.142'],
            footnote: 0,
            isWmz: true,
            metalplast: {
                2: { len: 460, index: 'AA / B' },
                3: { len: 510, index: 'AA / B' },
                4: { len: 560, index: 'B' },
                5: { len: 610, index: 'B' },
                6: { len: 660, index: 'B' },
                7: { len: 710, index: 'C' },
                8: { len: 760, index: 'C' },
                9: { len: 810, index: 'C' },
                10: { len: 860, index: 'D' },
                11: { len: 910, index: 'D' },
                12: { len: 960, index: 'E' },
                13: { len: 1010, index: 'E' }
            },
            stramax: {
                2: { len: 410, index: 'A' },
                3: { len: 460, index: 'AA / B' },
                4: { len: 510, index: 'AA / B' },
                5: { len: 560, index: 'B' },
                6: { len: 610, index: 'B' },
                7: { len: 660, index: 'B' },
                8: { len: 710, index: 'C' },
                9: { len: 760, index: 'C' },
                10: { len: 810, index: 'C' },
                11: { len: 860, index: 'D' },
                12: { len: 910, index: 'D' }
            }
        },
        {
            id: 'wmz_vert_mp',
            name: 'metalplast Anschluss-Set WMZ vertikal',
            category: 'WMZ-Sets',
            articles: ['51192.144', '51192.146'],
            footnote: 1,
            isWmz: true,
            metalplast: {
                2: { len: 363, index: 'A' },
                3: { len: 413, index: 'AA / B' },
                4: { len: 463, index: 'AA / B' },
                5: { len: 513, index: 'B' },
                6: { len: 563, index: 'B' },
                7: { len: 613, index: 'B' },
                8: { len: 663, index: 'C' },
                9: { len: 713, index: 'C' },
                10: { len: 763, index: 'C' },
                11: { len: 813, index: 'D' },
                12: { len: 863, index: 'D' },
                13: { len: 913, index: 'E' }
            },
            stramax: {
                2: { len: 313, index: 'A' },
                3: { len: 363, index: 'A' },
                4: { len: 413, index: 'AA / B' },
                5: { len: 463, index: 'AA / B' },
                6: { len: 513, index: 'B' },
                7: { len: 563, index: 'B' },
                8: { len: 613, index: 'B' },
                9: { len: 663, index: 'C' },
                10: { len: 713, index: 'C' },
                11: { len: 763, index: 'C' },
                12: { len: 813, index: 'D' }
            }
        },
        {
            id: 'winkel_wmz_vert_mp',
            name: 'Winkel zu metalplast Anschluss-Set WMZ vertikal',
            category: 'WMZ-Sets',
            articles: ['51192.130'],
            footnote: 0,
            isWmz: true,
            metalplast: {
                2: { len: 410, index: 'A' },
                3: { len: 460, index: 'AA / B' },
                4: { len: 510, index: 'AA / B' },
                5: { len: 560, index: 'B' },
                6: { len: 610, index: 'B' },
                7: { len: 660, index: 'B' },
                8: { len: 710, index: 'C' },
                9: { len: 760, index: 'C' },
                10: { len: 810, index: 'C' },
                11: { len: 860, index: 'D' },
                12: { len: 910, index: 'D' },
                13: { len: 960, index: 'E' }
            },
            stramax: {
                2: { len: 360, index: 'A' },
                3: { len: 410, index: 'A' },
                4: { len: 460, index: 'AA / B' },
                5: { len: 510, index: 'AA / B' },
                6: { len: 560, index: 'B' },
                7: { len: 610, index: 'B' },
                8: { len: 660, index: 'B' },
                9: { len: 710, index: 'C' },
                10: { len: 760, index: 'C' },
                11: { len: 810, index: 'C' },
                12: { len: 860, index: 'D' }
            }
        },

        // Seite 2
        {
            id: 'anschluss_horiz',
            name: 'Anschluss-Set horizontal',
            category: 'Standard-Sets',
            articles: ['51192.073', '51192.074'],
            footnote: 0,
            isWmz: false,
            metalplast: {
                2: { len: 280, index: 'A' },
                3: { len: 330, index: 'A' },
                4: { len: 380, index: 'A' },
                5: { len: 430, index: 'AA / B' },
                6: { len: 480, index: 'AA / B' },
                7: { len: 530, index: 'B' },
                8: { len: 580, index: 'B' },
                9: { len: 630, index: 'B' },
                10: { len: 680, index: 'C' },
                11: { len: 730, index: 'C' },
                12: { len: 780, index: 'C' },
                13: { len: 830, index: 'D' }
            },
            stramax: {
                2: { len: 230, index: 'A' },
                3: { len: 280, index: 'A' },
                4: { len: 330, index: 'A' },
                5: { len: 380, index: 'A' },
                6: { len: 430, index: 'AA / B' },
                7: { len: 480, index: 'AA / B' },
                8: { len: 530, index: 'B' },
                9: { len: 580, index: 'B' },
                10: { len: 630, index: 'B' },
                11: { len: 680, index: 'C' },
                12: { len: 730, index: 'C' }
            }
        },
        {
            id: 'anschluss_vert',
            name: 'Anschluss-Set vertikal',
            category: 'Standard-Sets',
            articles: ['51192.070', '51192.071'],
            footnote: 0,
            isWmz: false,
            metalplast: {
                2: { len: 366, index: 'A' },
                3: { len: 416, index: 'AA / B' },
                4: { len: 466, index: 'AA / B' },
                5: { len: 516, index: 'B' },
                6: { len: 566, index: 'B' },
                7: { len: 616, index: 'B' },
                8: { len: 666, index: 'C' },
                9: { len: 716, index: 'C' },
                10: { len: 766, index: 'C' },
                11: { len: 816, index: 'D' },
                12: { len: 866, index: 'D' },
                13: { len: 916, index: 'E' }
            },
            stramax: {
                2: { len: 316, index: 'A' },
                3: { len: 366, index: 'A' },
                4: { len: 416, index: 'AA / B' },
                5: { len: 466, index: 'AA / B' },
                6: { len: 516, index: 'B' },
                7: { len: 566, index: 'B' },
                8: { len: 616, index: 'B' },
                9: { len: 666, index: 'C' },
                10: { len: 716, index: 'C' },
                11: { len: 766, index: 'C' },
                12: { len: 816, index: 'D' }
            }
        },
        {
            id: 'wmz_horiz',
            name: 'WMZ-Set horizontal',
            category: 'WMZ-Sets',
            articles: ['51192.061', '51192.062'],
            footnote: 0,
            isWmz: true,
            metalplast: {
                2: { len: 508, index: 'AA / B' },
                3: { len: 558, index: 'B' },
                4: { len: 608, index: 'B' },
                5: { len: 658, index: 'B' },
                6: { len: 708, index: 'C' },
                7: { len: 758, index: 'C' },
                8: { len: 808, index: 'C' },
                9: { len: 858, index: 'D' },
                10: { len: 908, index: 'D' },
                11: { len: 958, index: 'E' },
                12: { len: 1008, index: 'E' },
                13: { len: 1058, index: 'E' }
            },
            stramax: {
                2: { len: 458, index: 'AA / B' },
                3: { len: 508, index: 'AA / B' },
                4: { len: 558, index: 'B' },
                5: { len: 608, index: 'B' },
                6: { len: 658, index: 'B' },
                7: { len: 708, index: 'C' },
                8: { len: 758, index: 'C' },
                9: { len: 808, index: 'C' },
                10: { len: 858, index: 'D' },
                11: { len: 908, index: 'D' },
                12: { len: 958, index: 'E' }
            }
        },
        {
            id: 'wmz_vert',
            name: 'WMZ-Set vertikal',
            category: 'WMZ-Sets',
            articles: ['51192.064', '51192.065'],
            footnote: 2,
            isWmz: true,
            metalplast: {
                2: { len: 366, index: 'A' },
                3: { len: 416, index: 'AA / B' },
                4: { len: 466, index: 'AA / B' },
                5: { len: 516, index: 'B' },
                6: { len: 566, index: 'B' },
                7: { len: 616, index: 'B' },
                8: { len: 666, index: 'C' },
                9: { len: 716, index: 'C' },
                10: { len: 766, index: 'C' },
                11: { len: 816, index: 'D' },
                12: { len: 866, index: 'D' },
                13: { len: 916, index: 'E' }
            },
            stramax: {
                2: { len: 316, index: 'A' },
                3: { len: 366, index: 'A' },
                4: { len: 416, index: 'AA / B' },
                5: { len: 466, index: 'AA / B' },
                6: { len: 516, index: 'B' },
                7: { len: 566, index: 'B' },
                8: { len: 616, index: 'B' },
                9: { len: 666, index: 'C' },
                10: { len: 716, index: 'C' },
                11: { len: 766, index: 'C' },
                12: { len: 816, index: 'D' }
            }
        },

        // Seite 3
        {
            id: 'stramax_horiz',
            name: 'Stramax Garnitur horizontal',
            category: 'Stramax-Sets',
            articles: ['51191.101', '51191.102'],
            footnote: 0,
            isWmz: false,
            metalplast: {
                2: { len: 445, index: 'AA / B' },
                3: { len: 495, index: 'AA / B' },
                4: { len: 545, index: 'B' },
                5: { len: 595, index: 'B' },
                6: { len: 645, index: 'B' },
                7: { len: 695, index: 'C' },
                8: { len: 745, index: 'C' },
                9: { len: 795, index: 'C' },
                10: { len: 845, index: 'D' },
                11: { len: 895, index: 'D' },
                12: { len: 945, index: 'E' },
                13: { len: 995, index: 'E' }
            },
            stramax: {
                2: { len: 395, index: 'A' },
                3: { len: 445, index: 'AA / B' },
                4: { len: 495, index: 'AA / B' },
                5: { len: 545, index: 'B' },
                6: { len: 595, index: 'B' },
                7: { len: 645, index: 'B' },
                8: { len: 695, index: 'C' },
                9: { len: 745, index: 'C' },
                10: { len: 795, index: 'C' },
                11: { len: 845, index: 'D' },
                12: { len: 895, index: 'D' }
            }
        },
        {
            id: 'stramax_vert',
            name: 'Stramax Garnitur vertikal',
            category: 'Stramax-Sets',
            articles: ['51191.105', '51191.106'],
            footnote: 2,
            isWmz: false,
            metalplast: {
                2: { len: 372, index: 'A' },
                3: { len: 422, index: 'AA / B' },
                4: { len: 472, index: 'AA / B' },
                5: { len: 522, index: 'B' },
                6: { len: 572, index: 'B' },
                7: { len: 622, index: 'B' },
                8: { len: 672, index: 'C' },
                9: { len: 722, index: 'C' },
                10: { len: 772, index: 'C' },
                11: { len: 822, index: 'D' },
                12: { len: 872, index: 'D' },
                13: { len: 922, index: 'E' }
            },
            stramax: {
                2: { len: 322, index: 'A' },
                3: { len: 372, index: 'A' },
                4: { len: 422, index: 'AA / B' },
                5: { len: 472, index: 'AA / B' },
                6: { len: 522, index: 'B' },
                7: { len: 572, index: 'B' },
                8: { len: 622, index: 'B' },
                9: { len: 672, index: 'C' },
                10: { len: 722, index: 'C' },
                11: { len: 772, index: 'C' },
                12: { len: 822, index: 'D' }
            }
        },
        {
            id: 'stramax_versal1',
            name: 'Stramax Versal 1 Garnitur',
            category: 'Stramax-Sets',
            articles: ['51191.117'],
            footnote: 2,
            isWmz: false,
            metalplast: {
                2: { len: 403, index: 'A' },
                3: { len: 453, index: 'AA / B' },
                4: { len: 503, index: 'AA / B' },
                5: { len: 553, index: 'B' },
                6: { len: 603, index: 'B' },
                7: { len: 653, index: 'B' },
                8: { len: 703, index: 'C' },
                9: { len: 753, index: 'C' },
                10: { len: 803, index: 'C' },
                11: { len: 853, index: 'D' },
                12: { len: 903, index: 'D' },
                13: { len: 953, index: 'E' }
            },
            stramax: {
                2: { len: 353, index: 'A' },
                3: { len: 403, index: 'A' },
                4: { len: 453, index: 'AA / B' },
                5: { len: 503, index: 'AA / B' },
                6: { len: 553, index: 'B' },
                7: { len: 603, index: 'B' },
                8: { len: 653, index: 'B' },
                9: { len: 703, index: 'C' },
                10: { len: 753, index: 'C' },
                11: { len: 803, index: 'C' },
                12: { len: 853, index: 'D' }
            }
        },
        {
            id: 'danfoss_horiz',
            name: 'Danfoss AB-PM Set horizontal',
            category: 'Danfoss-Sets',
            articles: ['00199.520', '00199.522', '00199.524', '00199.679'],
            footnote: 0,
            isWmz: false, // Ausnahmeregel: Differenzdruckventil enthalten, auch ohne WMZ nutzbar
            metalplast: {
                2: { len: 550, index: 'B' },
                3: { len: 600, index: 'B' },
                4: { len: 650, index: 'B' },
                5: { len: 700, index: 'C' },
                6: { len: 750, index: 'C' },
                7: { len: 800, index: 'C' },
                8: { len: 850, index: 'D' },
                9: { len: 900, index: 'D' },
                10: { len: 950, index: 'E' },
                11: { len: 1000, index: 'E' },
                12: { len: 1050, index: 'E' },
                13: { len: 1100, index: 'E' }
            },
            stramax: {
                2: { len: 500, index: 'AA / B' },
                3: { len: 550, index: 'B' },
                4: { len: 600, index: 'B' },
                5: { len: 650, index: 'B' },
                6: { len: 700, index: 'C' },
                7: { len: 750, index: 'C' },
                8: { len: 800, index: 'C' },
                9: { len: 850, index: 'D' },
                10: { len: 900, index: 'D' },
                11: { len: 950, index: 'E' },
                12: { len: 1000, index: 'E' }
            }
        },
        {
            id: 'danfoss_vert',
            name: 'Danfoss AB-PM Set vertikal',
            category: 'Danfoss-Sets',
            articles: ['00199.526', '00199.528', '00199.530', '00199.679'],
            footnote: 2,
            isWmz: false, // Ausnahmeregel: Differenzdruckventil enthalten, auch ohne WMZ nutzbar
            metalplast: {
                2: { len: 395, index: 'A' },
                3: { len: 445, index: 'AA / B' },
                4: { len: 495, index: 'AA / B' },
                5: { len: 545, index: 'B' },
                6: { len: 595, index: 'B' },
                7: { len: 645, index: 'B' },
                8: { len: 695, index: 'C' },
                9: { len: 745, index: 'C' },
                10: { len: 795, index: 'C' },
                11: { len: 845, index: 'D' },
                12: { len: 895, index: 'D' },
                13: { len: 945, index: 'E' }
            },
            stramax: {
                2: { len: 345, index: 'A' },
                3: { len: 395, index: 'A' },
                4: { len: 445, index: 'AA / B' },
                5: { len: 495, index: 'AA / B' },
                6: { len: 545, index: 'B' },
                7: { len: 595, index: 'B' },
                8: { len: 645, index: 'B' },
                9: { len: 695, index: 'C' },
                10: { len: 745, index: 'C' },
                11: { len: 795, index: 'C' },
                12: { len: 845, index: 'D' }
            }
        },

        // Seite 4
        {
            id: 'oventrop_hycocon_horiz',
            name: 'oventrop Hycocon VTZ horizontal',
            category: 'Oventrop-Sets',
            articles: ['00227.111', '00227.113', '00227.118'],
            footnote: 0,
            isWmz: true,
            metalplast: {
                2: { len: 641, index: 'B' },
                3: { len: 691, index: 'C' },
                4: { len: 741, index: 'C' },
                5: { len: 791, index: 'C' },
                6: { len: 841, index: 'D' },
                7: { len: 891, index: 'D' },
                8: { len: 941, index: 'E' },
                9: { len: 991, index: 'E' },
                10: { len: 1041, index: 'E' },
                11: { len: 1091, index: 'E' }
            },
            stramax: {
                2: { len: 591, index: 'B' },
                3: { len: 641, index: 'B' },
                4: { len: 691, index: 'C' },
                5: { len: 741, index: 'C' },
                6: { len: 791, index: 'C' },
                7: { len: 841, index: 'D' },
                8: { len: 891, index: 'D' },
                9: { len: 941, index: 'E' },
                10: { len: 991, index: 'E' },
                11: { len: 1041, index: 'E' },
                12: { len: 1091, index: 'E' }
            }
        },
        {
            id: 'oventrop_cocon_horiz',
            name: 'oventrop Cocon QTZ / QDP horizontal',
            category: 'Oventrop-Sets',
            articles: ['00227.117', '00227.102', '00227.104', '00227.118'],
            footnote: 0,
            isWmz: true,
            metalplast: {
                2: { len: 594, index: 'B' },
                3: { len: 644, index: 'B' },
                4: { len: 694, index: 'C' },
                5: { len: 744, index: 'C' },
                6: { len: 794, index: 'C' },
                7: { len: 844, index: 'D' },
                8: { len: 894, index: 'D' },
                9: { len: 944, index: 'E' },
                10: { len: 994, index: 'E' },
                11: { len: 1044, index: 'E' },
                12: { len: 1094, index: 'E' }
            },
            stramax: {
                2: { len: 544, index: 'B' },
                3: { len: 594, index: 'B' },
                4: { len: 644, index: 'B' },
                5: { len: 694, index: 'C' },
                6: { len: 744, index: 'C' },
                7: { len: 794, index: 'C' },
                8: { len: 844, index: 'D' },
                9: { len: 894, index: 'D' },
                10: { len: 944, index: 'E' },
                11: { len: 994, index: 'E' },
                12: { len: 1044, index: 'E' }
            }
        },
        {
            id: 'oventrop_hycocon_vert',
            name: 'oventrop Hycocon VTZ vertikal',
            category: 'Oventrop-Sets',
            articles: ['00227.110', '00227.112', '00227.118'],
            footnote: 2,
            isWmz: true,
            metalplast: {
                2: { len: 420, index: 'AA / B' },
                3: { len: 470, index: 'AA / B' },
                4: { len: 520, index: 'B' },
                5: { len: 570, index: 'B' },
                6: { len: 620, index: 'B' },
                7: { len: 670, index: 'C' },
                8: { len: 720, index: 'C' },
                9: { len: 770, index: 'C' },
                10: { len: 820, index: 'D' },
                11: { len: 870, index: 'D' },
                12: { len: 920, index: 'E' },
                13: { len: 970, index: 'E' }
            },
            stramax: {
                2: { len: 370, index: 'A' },
                3: { len: 420, index: 'AA / B' },
                4: { len: 470, index: 'AA / B' },
                5: { len: 520, index: 'B' },
                6: { len: 570, index: 'B' },
                7: { len: 620, index: 'B' },
                8: { len: 670, index: 'C' },
                9: { len: 720, index: 'C' },
                10: { len: 770, index: 'C' },
                11: { len: 820, index: 'D' },
                12: { len: 870, index: 'D' }
            }
        },
        {
            id: 'oventrop_cocon_vert',
            name: 'oventrop Cocon QTZ / QDP vertikal',
            category: 'Oventrop-Sets',
            articles: ['00227.116', '00227.103', '00227.105', '00227.118'],
            footnote: 2,
            isWmz: true,
            metalplast: {
                2: { len: 420, index: 'AA / B' },
                3: { len: 470, index: 'AA / B' },
                4: { len: 520, index: 'B' },
                5: { len: 570, index: 'B' },
                6: { len: 620, index: 'B' },
                7: { len: 670, index: 'C' },
                8: { len: 720, index: 'C' },
                9: { len: 770, index: 'C' },
                10: { len: 820, index: 'D' },
                11: { len: 870, index: 'D' },
                12: { len: 920, index: 'E' },
                13: { len: 970, index: 'E' }
            },
            stramax: {
                2: { len: 370, index: 'A' },
                3: { len: 420, index: 'AA / B' },
                4: { len: 470, index: 'AA / B' },
                5: { len: 520, index: 'B' },
                6: { len: 570, index: 'B' },
                7: { len: 620, index: 'B' },
                8: { len: 670, index: 'C' },
                9: { len: 720, index: 'C' },
                10: { len: 770, index: 'C' },
                11: { len: 820, index: 'D' },
                12: { len: 870, index: 'D' }
            }
        },

        // Seite 5
        {
            id: 'ta_compact_dp_horiz',
            name: 'TA-Compact-DP Set horizontal',
            category: 'TA-Compact-Sets',
            articles: ['00434.690', '00434.691', '00434.692', '04078.701'],
            footnote: 0,
            isWmz: true,
            metalplast: {
                2: { len: 538, index: 'B' },
                3: { len: 588, index: 'B' },
                4: { len: 638, index: 'B' },
                5: { len: 688, index: 'C' },
                6: { len: 738, index: 'C' },
                7: { len: 788, index: 'C' },
                8: { len: 838, index: 'D' },
                9: { len: 888, index: 'D' },
                10: { len: 938, index: 'E' },
                11: { len: 988, index: 'E' },
                12: { len: 1038, index: 'E' },
                13: { len: 1088, index: 'E' }
            },
            stramax: {
                2: { len: 488, index: 'AA / B' },
                3: { len: 538, index: 'B' },
                4: { len: 588, index: 'B' },
                5: { len: 638, index: 'B' },
                6: { len: 688, index: 'C' },
                7: { len: 738, index: 'C' },
                8: { len: 788, index: 'C' },
                9: { len: 838, index: 'D' },
                10: { len: 888, index: 'D' },
                11: { len: 938, index: 'E' },
                12: { len: 988, index: 'E' }
            }
        },
        {
            id: 'ta_compact_p_horiz',
            name: 'TA-Compact-P Set horizontal',
            category: 'TA-Compact-Sets',
            articles: ['00434.680', '00434.681', '00434.682', '04078.701'],
            footnote: 0,
            isWmz: true,
            metalplast: {
                2: { len: 538, index: 'B' },
                3: { len: 588, index: 'B' },
                4: { len: 638, index: 'B' },
                5: { len: 688, index: 'C' },
                6: { len: 738, index: 'C' },
                7: { len: 788, index: 'C' },
                8: { len: 838, index: 'D' },
                9: { len: 888, index: 'D' },
                10: { len: 938, index: 'E' },
                11: { len: 988, index: 'E' },
                12: { len: 1038, index: 'E' },
                13: { len: 1088, index: 'E' }
            },
            stramax: {
                2: { len: 488, index: 'AA / B' },
                3: { len: 538, index: 'B' },
                4: { len: 588, index: 'B' },
                5: { len: 638, index: 'B' },
                6: { len: 688, index: 'C' },
                7: { len: 738, index: 'C' },
                8: { len: 788, index: 'C' },
                9: { len: 838, index: 'D' },
                10: { len: 888, index: 'D' },
                11: { len: 938, index: 'E' },
                12: { len: 988, index: 'E' }
            }
        },
        {
            id: 'ta_compact_dp_vert',
            name: 'TA-Compact-DP Set vertikal',
            category: 'TA-Compact-Sets',
            articles: ['00434.693', '00434.694', '00434.695', '04078.701'],
            footnote: 2,
            isWmz: true,
            metalplast: {
                2: { len: 464, index: 'AA / B' },
                3: { len: 514, index: 'B' },
                4: { len: 564, index: 'B' },
                5: { len: 614, index: 'B' },
                6: { len: 664, index: 'C' },
                7: { len: 714, index: 'C' },
                8: { len: 764, index: 'C' },
                9: { len: 814, index: 'D' },
                10: { len: 864, index: 'D' },
                11: { len: 914, index: 'E' },
                12: { len: 964, index: 'E' },
                13: { len: 1014, index: 'E' }
            },
            stramax: {
                2: { len: 414, index: 'AA / B' },
                3: { len: 464, index: 'AA / B' },
                4: { len: 514, index: 'B' },
                5: { len: 564, index: 'B' },
                6: { len: 614, index: 'B' },
                7: { len: 664, index: 'C' },
                8: { len: 714, index: 'C' },
                9: { len: 764, index: 'C' },
                10: { len: 814, index: 'D' },
                11: { len: 864, index: 'D' },
                12: { len: 914, index: 'E' }
            }
        },
        {
            id: 'ta_compact_p_vert',
            name: 'TA-Compact-P Set vertikal',
            category: 'TA-Compact-Sets',
            articles: ['00434.683', '00434.684', '00434.685', '04078.701'],
            footnote: 2,
            isWmz: true,
            metalplast: {
                2: { len: 425, index: 'AA / B' },
                3: { len: 475, index: 'AA / B' },
                4: { len: 525, index: 'B' },
                5: { len: 575, index: 'B' },
                6: { len: 625, index: 'B' },
                7: { len: 675, index: 'C' },
                8: { len: 725, index: 'C' },
                9: { len: 775, index: 'C' },
                10: { len: 825, index: 'D' },
                11: { len: 875, index: 'D' },
                12: { len: 925, index: 'E' },
                13: { len: 975, index: 'E' }
            },
            stramax: {
                2: { len: 375, index: 'A' },
                3: { len: 425, index: 'AA / B' },
                4: { len: 475, index: 'AA / B' },
                5: { len: 525, index: 'B' },
                6: { len: 575, index: 'B' },
                7: { len: 625, index: 'B' },
                8: { len: 675, index: 'C' },
                9: { len: 725, index: 'C' },
                10: { len: 775, index: 'C' },
                11: { len: 825, index: 'D' }
            }
        }
    ],

    /**
     * Ermittelt die Kasten-Empfehlung und passende Schrankmodelle
     */
    getRecommendation: function(distributorType, connectionSetId, rings, allowedCabinetKeys) {
        if (!rings || rings <= 0) return null;
        
        const distType = (distributorType === 'stramax') ? 'stramax' : 'metalplast';
        const effectiveRings = Math.min(rings, distType === 'stramax' ? 12 : 13);
        const ringKey = Math.max(2, effectiveRings);
        
        const setInfo = this.connectionSets.find(s => s.id === connectionSetId) || this.connectionSets[0];
        const distData = setInfo[distType] || setInfo.metalplast;
        const entry = distData[ringKey] || distData[Math.max(...Object.keys(distData).map(Number))];
        
        if (!entry) return null;
        
        const requiredIndex = entry.index;
        const manifoldLength = entry.len;
        const minWidth = this.indexWidthMap[requiredIndex] || 500;
        
        const matchingCabinets = [];
        const setFootnote = setInfo.footnote || 0;
        
        const keysToSearch = (allowedCabinetKeys && allowedCabinetKeys.length > 0) 
            ? allowedCabinetKeys 
            : Object.keys(this.cabinetModels);
            
        keysToSearch.forEach(cabKey => {
            const cab = this.cabinetModels[cabKey];
            if (!cab) return;
            
            if (cab.footnoteRestriction && cab.footnoteRestriction === setFootnote) {
                return;
            }
            if (setFootnote === 1 && cab.id === 'beton_125') {
                return;
            }
            if (setFootnote === 2 && cab.id === 'eps_boden') {
                return;
            }
            
            let articleNo = cab.articles[requiredIndex];
            let width = cab.widths[requiredIndex];
            
            if (!articleNo && requiredIndex === 'AA / B') {
                articleNo = cab.articles['B'] || cab.articles['A'];
                width = cab.widths['B'] || cab.widths['A'];
            }
            
            if (articleNo) {
                matchingCabinets.push({
                    key: cab.id,
                    name: cab.name,
                    shortName: cab.shortName,
                    type: cab.type,
                    depth: cab.depth,
                    height: cab.height || '750 mm',
                    width: width || minWidth,
                    articleNo: articleNo
                });
            }
        });
        
        return {
            distributorType: distType === 'stramax' ? 'Stramax Messing-Verteiler 1"' : 'metalplast Inox-Verteiler 1"',
            connectionSetId: setInfo.id,
            connectionSetName: setInfo.name,
            isWmz: !!setInfo.isWmz,
            rings: rings,
            manifoldLength: manifoldLength,
            requiredIndex: requiredIndex,
            minWidth: minWidth,
            primaryCabinet: matchingCabinets.length > 0 ? matchingCabinets[0] : null,
            matchingCabinets: matchingCabinets
        };
    }
};

if (typeof window !== 'undefined') {
    window.FBHV_DATABASE = FBHV_DATABASE;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FBHV_DATABASE;
}