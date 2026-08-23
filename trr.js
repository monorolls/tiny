(function () {

    /* ==========================================
       COUNTRIES THAT SHOULD BE TRANSLATED
       ========================================== */

    const countryLanguages = {
        DE: 'de', // Germany
        IT: 'it', // Italy
        ES: 'es', // Spain
        FR: 'fr', // France
        BR: 'pt'  // Brazil
    };


    /* ==========================================
       HIDE GOOGLE TRANSLATE
       ========================================== */

    const style = document.createElement('style');

    style.textContent = `
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        .goog-te-balloon-frame,
        .goog-te-gadget,
        .goog-te-menu-value,
        .goog-te-spinner-pos,
        #goog-gt-tt,
        body > .skiptranslate,
        iframe.goog-te-banner-frame {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
        }

        body {
            top: 0 !important;
            position: static !important;
        }

        .goog-text-highlight {
            background: transparent !important;
            box-shadow: none !important;
        }

        #google_translate_element {
            display: none !important;
            visibility: hidden !important;
            position: absolute !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
        }
    `;

    document.head.appendChild(style);


    /* ==========================================
       CREATE TRANSLATE CONTAINER
       ========================================== */

    const container = document.createElement('div');

    container.id = 'google_translate_element';

    container.style.display = 'none';

    document.body.appendChild(container);


    /* ==========================================
       COOKIE FUNCTIONS
       ========================================== */

    function getCookie(name) {

        const nameEQ = name + '=';

        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {

            let cookie = cookies[i].trim();

            if (cookie.indexOf(nameEQ) === 0) {

                return cookie.substring(nameEQ.length);

            }
        }

        return null;
    }


    function deleteCookie(name) {

        document.cookie =
            name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        /*
         * Also remove possible domain cookies.
         */

        document.cookie =
            name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' +
            location.hostname + ';';

        document.cookie =
            name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' +
            location.hostname + ';';
    }


    function setTranslation(language) {

        document.cookie =
            'googtrans=/en/' +
            language +
            '; path=/; SameSite=Lax';

    }


    /* ==========================================
       DETECT VISITOR COUNTRY
       ========================================== */

    async function detectCountry() {

        try {

            const response = await fetch(
                'https://ipapi.co/json/',
                {
                    cache: 'no-store'
                }
            );

            if (!response.ok) {
                throw new Error('Country detection failed');
            }

            const data = await response.json();

            const country =
                (data.country_code || '').toUpperCase();

            const language =
                countryLanguages[country];


            /* ======================================
               OTHER COUNTRIES
               KEEP ORIGINAL ENGLISH
               ====================================== */

            if (!language) {

                /*
                 * Remove any old Google Translate
                 * language saved from a previous visit.
                 */

                deleteCookie('googtrans');

                /*
                 * Remove Google Translate session.
                 */

                sessionStorage.removeItem(
                    'geoTranslationStarted'
                );

                return;
            }


            /* ======================================
               TARGET COUNTRY
               ====================================== */

            const wantedTranslation =
                '/en/' + language;

            const currentTranslation =
                getCookie('googtrans');


            /*
             * Already using the correct language.
             */

            if (
                currentTranslation ===
                wantedTranslation
            ) {

                return;
            }


            /*
             * Set correct language.
             */

            setTranslation(language);


            /*
             * Reload only once.
             */

            if (
                !sessionStorage.getItem(
                    'geoTranslationStarted'
                )
            ) {

                sessionStorage.setItem(
                    'geoTranslationStarted',
                    '1'
                );

                location.reload();
            }


        } catch (error) {

            /*
             * If country detection fails,
             * KEEP ORIGINAL ENGLISH.
             */

            console.log(
                'Country detection failed:',
                error
            );

        }

    }


    /* ==========================================
       GOOGLE TRANSLATE INITIALIZATION
       ========================================== */

    window.googleTranslateElementInit = function () {

        new google.translate.TranslateElement({

            pageLanguage: 'en',

            autoDisplay: false,

            includedLanguages:
                'de,it,es,fr,pt',

            multilanguagePage: true

        }, 'google_translate_element');

    };


    /* ==========================================
       LOAD GOOGLE TRANSLATE
       ========================================== */

    const translateScript =
        document.createElement('script');

    translateScript.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

    translateScript.async = true;

    document.head.appendChild(
        translateScript
    );


    /* ==========================================
       START COUNTRY DETECTION
       ========================================== */

    detectCountry();


    /* ==========================================
       ALWAYS HIDE TRANSLATE BAR
       ========================================== */

    const observer =
        new MutationObserver(function () {

            document
                .querySelectorAll(
                    '.goog-te-banner-frame, .skiptranslate'
                )
                .forEach(function (element) {

                    element.style.display =
                        'none';

                    element.style.visibility =
                        'hidden';

                });

            document.body.style.top = '0px';

        });


    observer.observe(
        document.documentElement,
        {
            childList: true,
            subtree: true
        }
    );

})();
