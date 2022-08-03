import * as ReportService from './report.service';

export async function getReport(req, res) {
    try {
        return res.RH.success(await ReportService.getReports());
    } catch (error) {
        return res.RH.error(error);
    }
}
