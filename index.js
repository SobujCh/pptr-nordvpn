
async function connectvpn(...txt){
    allGood=false;
    await page.goto('chrome-extension://fjoaledfpmneenckfbpdfhkmimnjocfa/index.html')
    await sleep(1000);
    let isLoginPage =  await page.evaluate(() => {
        let el = document.querySelector("[data-testid=login-login-button]")
        return el ? true : false;
    });
    if(isLoginPage){
        textlog("Login page detected...");
        page.click('[data-testid=login-login-button]');
        shouldWait=true;
        while (shouldWait) {
            textlog('Waiting for second page.');
            allPages = await browser.pages();
            shouldWait=(allPages.length==2)?false:true;
            await sleep(1000);
        }
        textlog("loging in.");
        allPages = await browser.pages();
        textlog('Page Count: ',allPages.length);
        let page2 = allPages[1];
        textlog('Second Page Found.');
        shouldWait=true;
        while (shouldWait) {
            textlog('Waiting for username field.');
            try {
                shouldWait =  await page2.evaluate(() => {
                    let el = document.querySelector("[data-testid='identifier-input']");
                    return el ? false : true;
                });
            } catch (error) {}
            await sleep(100);
        }
        textlog('Page Loaded, Typing username.');
        await page2.type("[data-testid='identifier-input']", '', {delay: 50});
        await sleep(1000);
        page2.click('[data-testid=identifier-submit]');
        textlog('Continue clicked.');
        shouldWait=true;
        while (shouldWait) {
            textlog('Waiting for password field.');
            try {
                shouldWait =  await page2.evaluate(() => {
                    let el = document.querySelector("[data-testid='signin-password-input']");
                    return el ? false : true;
                });
            } catch (error) { }
            if(!shouldWait)break;
            await sleep(1000);
        }
        textlog('Typing password.');
        await page2.type("[data-testid='signin-password-input']", '', {delay: 50});
        await sleep(1000);
        page2.click('[data-testid=signin-button]');
    }

    shouldWait=true;
    let alreadyConnected = false;
    while (shouldWait) {
        textlog('Waiting for quick connect button.');
        try{
            alreadyConnected =  await page.evaluate(() => {
                let el = document.querySelector("[data-testid='topbar-right']");
                return (el && el.innerHTML.indexOf('Connected')) ? true : false;
            });
        }catch(error) {}
        try {
            shouldWait =  await page.evaluate(() => {
                let el = document.querySelector("[data-testid='home-quick-connect-button']");
                return el ? false : true;
            });
        } catch (error) {}
        if(alreadyConnected){
            textlog('already connected.');
            shouldWait=false;
        }
        if(!shouldWait)break;
        await sleep(1000);
    }
    if(!alreadyConnected){
        page.click("[data-testid='home-quick-connect-button']");
        await sleep(1000);
        shouldWait=true;
        while (shouldWait) {
            textlog('Connecting to VPN...');
            try {
                shouldWait =  await page.evaluate(() => {
                    let el = document.querySelector("[data-testid='topbar-right']");
                    if(el && el.innerHTML.indexOf('Connected')){
                        allGood=true;
                        return false;
                    }
                    return true;
                });
            } catch (error) {}
            await sleep(1000);
            if(!shouldWait)break;
        }
    }else{
        textlog('Reconnecting to avoid stall.'); 
        const refresh_btn = await page.waitForSelector("[data-testid='home-refresh-button']");
        await refresh_btn.evaluate( refresh_btn => refresh_btn.click() );
        await sleep(1000);
        shouldWait=true;
        while (shouldWait) {
            textlog('Reconnecting to VPN...');
            try {
                shouldWait =  await page.evaluate(() => {
                    let el = document.querySelector("[data-testid='topbar-right']");
                    if(el && el.innerHTML.indexOf('Connected')){
                        allGood=true;
                        return false;
                    }
                    return true;
                });
            } catch (error) {}
            await sleep(1000);
            if(!shouldWait)break; 
        }
        allGood=true;
    }
    textlog('VPN Connected.');
}
export { connectvpn as default };