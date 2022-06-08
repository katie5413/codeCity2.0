window.onload = function () {
    google.accounts.id.initialize({
        client_id: '685825699644-gou84ncq4etnkgmoof1ri4mb0b8171ai.apps.googleusercontent.com',
        callback: handleCredentialResponse,
    });

};

function handleCredentialResponse(response) {
    const responsePayload = jwt_decode(response.credential);
    // console.log(responsePayload)
}
