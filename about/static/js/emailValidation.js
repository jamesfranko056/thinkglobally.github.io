var emailDomainBlacklist = [
        '@gmail.com',
        '@hotmail.com',
        '@outlook.com',
        '@live.com',
        '@yahoo.com',
        '@msn.com',
        '@mac.com',
        '@comcast.net',
        '@charter.net',
        '@cox.net',
        '@fastmail.fm',
        '@rogers.com'
    ],
    emailTopLevelDomainBlacklist = [
        '.mil',
        '.gov'
    ],
    internalEmailDomainList = [
        '@microsoft.com',
        '@exchange.microsoft.com'
    ];

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function showEmailFormError(title, message, inputError, inputTerms) {
    inputError.html("<span class='input-error-title'>" + title + ": </span>" + "<span>" + message + "</span>");
    inputError.show();

    if(inputTerms){
        inputTerms.hide();
    }
}

function recordEmailAddress(email, sourceId, invalid) {
    var client = new WindowsAzure.MobileServiceClient(
        "https://powerbiweb.azure-mobile.net/",
        "dbeMAclOLRNDyCpvHUngvRqfLosVXw38"
    );

    var message = {
        email: email,
        visitor_id: sourceId,
        invalid: invalid
    };


    //inputButton.attr('disabled', 'disabled');

    client.getTable('presignups').insert(message).done(
        // onComplete
        function(message) {
            //inputButton.removeAttr("disabled");
        },
        // onerror
        function(error) {
            //inputButton.removeAttr("disabled");
        }
    );
    return false; // prevent form submit
}


function setupEmailValidation(inputField, inputError, inputButton, inputTerms, formId)
{
    inputField.keyup(function(e) {
        inputError.hide();

        if(inputTerms){
            inputTerms.show();
        }

        if (e.keyCode === 13) {
            validateEmailForm(formId);
        }
    });
};


function validateEmailForm(formId)
{
    var form = $("#" + formId),
        inputField = form.find('input:text'),
        inputError = form.find('.input-error'),
        inputButton = form.find('input:submit'),
        inputTerms = form.find('.disclaimer-text'),
        ruInput = form.find('input[name=ru]');

    try {
        MscomCustomEvent("wcs.cid", "power-bi-signup-click");
        MscomCustomEvent("wcs.cid", "power-bi-signup-click-" + formId);
    }catch(e){}

    var sourceId;
    try {
        sourceId = MscomGetCookie(wcsFpcC).match(/ID=([a-z0-9]*)/)[1];
    } catch (e) {
        sourceId = 0;
    }
    var ru = "https://app.powerbi.com?redirectedFromSignup=1&noSignUpCheck=1&pbi_source=web&pbi_source_id=" + sourceId;
    form.find("input[name='ReturnUrl']").val(ru);

    var emailAddress = inputField.val();
    var finalSegment = emailAddress.substr(emailAddress.lastIndexOf("."));

    if (emailAddress.length === 0)
    {
        try {
            MscomCustomEvent("wcs.cid", "power-bi-signup-empty-email");
            MscomCustomEvent("wcs.cid", "power-bi-signup-empty-email-" + formId);
        } catch (e) {}  

        showEmailFormError(ClientTranslations.Errors.ErrorEmailRequired, ClientTranslations.Errors.ErrorEmailRequiredDesc, inputError, inputTerms);
        
        return false;
    }

    // show error for invalid emails
    if (validateEmail(emailAddress) === false) 
    {
        try {
            MscomCustomEvent("wcs.cid", "power-bi-signup-invalid-email");
            MscomCustomEvent("wcs.cid", "power-bi-signup-invalid-email-" + formId);
        } catch (e) {}  

        showEmailFormError(ClientTranslations.Errors.ErrorInvalidEmail, ClientTranslations.Errors.ErrorEmailRequiredDesc, inputError, inputTerms);
        
        return false;
    }

    // show error for blacklisted email domains
    for (var i = 0; i < emailDomainBlacklist.length; i++) {
        if (emailAddress.indexOf(emailDomainBlacklist[i]) != -1) 
        {
            try {
                MscomCustomEvent("wcs.cid", "power-bi-signup-consumer-email");
                MscomCustomEvent("wcs.cid", "power-bi-signup-consumer-email-" + formId);
            } catch (e) {}     

            showEmailFormError(ClientTranslations.Errors.ErrorPersonalEmail, ClientTranslations.Errors.ErrorPersonalEmailDesc, inputError, inputTerms);
            recordEmailAddress(emailAddress, sourceId, true);
            
            return false;
        }
    }

    // show error for .gov and .mil addresses
    ////only show error if .gov or .mil is the final segment
    for (var i = 0; i < emailTopLevelDomainBlacklist.length; i++) {
        if (finalSegment.indexOf(emailTopLevelDomainBlacklist[i]) != -1) 
        {
            try {
                MscomCustomEvent("wcs.cid", "power-bi-signup-blocked-email-gcc");
                MscomCustomEvent("wcs.cid", "power-bi-signup-blocked-email-gcc-" + formId);
            } catch (e) {}                

            showEmailFormError(ClientTranslations.Errors.ErrorNotAvailable, ClientTranslations.Errors.ErrorNotAvailableDesc, inputError, inputTerms);
            recordEmailAddress(emailAddress, sourceId, true);
            
            return false;
        }
    }

    // redirect internal users straight to the app
    for (var i = 0; i < internalEmailDomainList.length; i++) {
        if (emailAddress.indexOf(internalEmailDomainList[i]) != -1) 
        {
            try {
                MscomCustomEvent("wcs.cid", "power-bi-signup-navigate-internal");
                MscomCustomEvent("wcs.cid", "power-bi-signup-navigate-internal-" + formId);
                recordEmailAddress(emailAddress, sourceId, false);
            } catch (e) {}   

            if (formId === 'quickbooks-page-email-input-header') {
                window.location = 'https://app.powerbi.com/get-data/quickbooks-online';
            } else {
                window.location = 'https://app.powerbi.com/?noSignUpCheck=1';
            }

            return false;
        }
    }

    var urlEncodedRU = encodeURIComponent(ru);
        actionUrl = "https://docs.google.com/forms/d/1uBh1WX8-LiIhb81RO1VZ39fE7dd5vlMB7PrQhdVtBR0/formResponse";
    $('form#' + formId).attr('action', actionUrl);
    
    try{
        MscomCustomEvent("wcs.cid", "power-bi-signup-navigate-external");
        MscomCustomEvent("wcs.cid", "power-bi-signup-navigate-external-" + formId);
        recordEmailAddress(emailAddress, sourceId, false);

        Munchkin.munchkinFunction('clickLink', {href: url});
    }
    catch (e){
        return true;
    }
    finally{
        return true;
    }
}


$(document).ready(function()
{
    $('.email-form').each(function(index, element)
    {
        var el = $(element);
            input = el.find('input'),
            errorText = el.find('.input-error'),
            submitBtn = el.find('button'),
            termsText = el.find('.disclaimer-text');

        setupEmailValidation(input, errorText, submitBtn, termsText, el.attr("id"));
    });
});












