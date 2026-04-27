export default function LedgerTable({ ledger }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="text-xs uppercase bg-gray-700 text-gray-300">
          <tr>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Voter ID</th>
            <th className="px-4 py-3">Encrypted Cipher</th>
            <th className="px-4 py-3">Hash</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((block, idx) => (
            <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50">
              <td className="px-4 py-3">{new Date(block.timestamp).toLocaleString()}</td>
              <td className="px-4 py-3 font-mono">{block.voter_id}</td>
              <td className="px-4 py-3 font-mono text-xs max-w-xs truncate" title={block.encrypted_vote}>{block.encrypted_vote}</td>
              <td className="px-4 py-3 font-mono text-xs text-cyan-400 max-w-xs truncate" title={block.hash}>{block.hash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
