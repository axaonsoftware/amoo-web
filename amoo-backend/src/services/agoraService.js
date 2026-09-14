const {
    RtcTokenBuilder,
    RtcRole,
} = require("agora-token");

const generateToken = (channelName, uid) => {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
        throw new Error("Agora credentials are missing");
    }

    const tokenExpirationInSeconds = 3600;
    const privilegeExpirationInSeconds = 3600;

    return RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        Number(uid),
        RtcRole.PUBLISHER,
        tokenExpirationInSeconds,
        privilegeExpirationInSeconds
    );
};

module.exports = {
    generateToken,
};