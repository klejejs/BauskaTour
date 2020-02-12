
    function startGA() {
//         <!-- Google Analytics -->
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-152639663-1', 'auto');
            ga('send', 'pageview');
//         <!-- End Google Analytics -->
    }


        window.cookieconsent.initialise({
            "palette": {
                "popup": {
                    "background": "#edeff5",
                    "text": "#838391"
                },
                "button": {
                    "background": "#4b81e8"
                }
            },
            "theme": "classic",
            "type": "opt-in",
            content: {
                header: 'Cookies used on the website!',
                message: 'This website uses cookies to improve your experience.',
                dismiss: 'Got it!',
                allow: 'Allow cookies',
                deny: 'Decline',
                link: 'Learn more',
                // !!! Place of cookie policy !!!
                href: 'https://www.cookiesandyou.com',
                close: '&#x274c;',
                policy: 'Cookie Policy',
                target: '_blank',
            },
            cookie: {
                expiryDays: 365 // Default
            },
            onInitialise: function (status) {
                var didConsent = this.hasConsented();
                if (didConsent) {
                    // enable cookies
                    // Enable Google Analytics traffic report
                    startGA();
                } else {
                    // disable cookies
                    // Disable Google Analytics traffic report
                    window['ga-disable-UA-152639663-1'] = true;
                }
            },
            onStatusChange: function(status, chosenBefore) {
                var didConsent = this.hasConsented();
                if (didConsent) {
                    // enable cookies
                    // Enable Google Analytics traffic report
                    startGA();
                } else {
                    // disable cookies
                    // Disable Google Analytics traffic report
                    window['ga-disable-UA-152639663-1'] = true;
                }
            },
        });
