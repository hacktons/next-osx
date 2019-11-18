
class Storage {
    saveLaunchConfig = async (config = {
        custom_sample_count_checked: false,
        sample_count_value: 10,
        screenshot_checked: false,
        launch_log_checked: true,
        custom_timeout_checked: false,
        timeout_value: 10,
    }) => {
        window.localStorage.setItem('launch_config', JSON.stringify(config));
    }
    getLaunchConfig = async () => {
        const data = window.localStorage.getItem('launch_config')
        if (data && data !== '') {
            return JSON.parse(data);
        }
        return {
            custom_sample_count_checked: false,
            sample_count_value: 10,
            screenshot_checked: false,
            launch_log_checked: true,
            custom_timeout_checked: false,
            timeout_value: 10,
        };
    }
}
export default Storage;