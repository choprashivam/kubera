import FileUpload from "~/components/FileUpload";

const AdminPage = () => {
  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Import Scrips Data</h2>
        <FileUpload importType="Scrips" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Import User CRM Data</h2>
        <FileUpload importType="UserCrm" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Import Holdings Transaction Data</h2>
        <FileUpload importType="HoldingsTrx" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Import Realised PnL Data</h2>
        <FileUpload importType="RealisedPnl" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Import Ledger Data</h2>
        <FileUpload importType="Ledger" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Import Current Ledger Balance Data</h2>
        <FileUpload importType="CurrentLedgerBalance" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Import Today Algo Pnl Data</h2>
        <FileUpload importType="TodayAlgoPnl" />
      </div>
    </div>
  );
};

export default AdminPage;