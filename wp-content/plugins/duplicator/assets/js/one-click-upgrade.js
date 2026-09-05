// Endpoint to connect to Duplicator Pro
var remoteEndpoint = "https://connect.duplicator.com/get-remote-url";

jQuery(document).ready(function ($) {
    if ($('#dup-settings-connect-btn').length) {
        $('#dup-settings-connect-btn').on('click', function (event) {
            event.stopPropagation();

            // Generate OTH for secure redirect
            Duplicator.Util.ajaxWrapper(
                {
                    action: 'duplicator_generate_connect_oth',
                    nonce: dup_one_click_upgrade_script_data.nonce_generate_connect_oth
                },
                function (result, data, funcData, textStatus, jqXHR) {
                    var redirectUrl = remoteEndpoint + "?" + new URLSearchParams({
                        "oth": funcData.oth,
                        "homeurl": window.location.origin,
                        "redirect": funcData.redirect_url,
                        "origin": window.location.href,
                        "php_version": funcData.php_version,
                        "wp_version": funcData.wp_version
                    }).toString();

                    window.location.href = redirectUrl;
                },
                function (result, data, funcData, textStatus, jqXHR) {
                    let errorMsg = `<p>
                        <b>${dup_one_click_upgrade_script_data.fail_notice_title}</b>
                    </p>
                    <p>
                        ${dup_one_click_upgrade_script_data.fail_notice_message_label} ${data.message}<br>
                        ${dup_one_click_upgrade_script_data.fail_notice_suggestion}
                    </p>`;
                    Duplicator.addAdminMessage(errorMsg, 'error');
                }
            );
        });
    }
});
