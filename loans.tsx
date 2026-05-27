'use client';


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';


export default function TRACOLoansPage() {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Fetch user loans from API
    const fetchLoans = async () => {
      try {
        const response = await fetch('/api/traco/loans');
        const data = await response.json();
        setLoans(data.loans || []);
      } catch (error) {
        console.error('[v0] Failed to fetch loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);


  const repaymentData = selectedLoan
    ? [
        { month: 'Month 1', paid: selectedLoan.dailyPaymentUSD * 30, remaining: selectedLoan.totalPaymentUSD - selectedLoan.totalPaidUSD },
        { month: 'Month 3', paid: selectedLoan.dailyPaymentUSD * 90, remaining: selectedLoan.totalPaymentUSD - selectedLoan.totalPaidUSD - (selectedLoan.dailyPaymentUSD * 90) },
        { month: 'Month 6', paid: selectedLoan.dailyPaymentUSD * 180, remaining: selectedLoan.totalPaymentUSD - selectedLoan.totalPaidUSD - (selectedLoan.dailyPaymentUSD * 180) },
      ]
    : [];


  if (loading) return <div className="p-6 text-center">Loading...</div>;


  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-bold text-green-900 mb-2">TRACO Loan Portal</h1>
      <p className="text-green-700 mb-6">Manage your tractor financing with daily automated payments</p>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Loans Summary */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-900">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{loans.filter(l => l.status === 'ACTIVE').length}</div>
            <p className="text-sm text-gray-600 mt-2">Active financing agreements</p>
          </CardContent>
        </Card>


        {/* Total Debt */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {loans.reduce((sum, l) => sum + (l.totalPaymentUSD - l.totalPaidUSD), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <p className="text-sm text-gray-600 mt-2">Remaining principal + interest</p>
          </CardContent>
        </Card>


        {/* Next Payment Due */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-900">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {selectedLoan ? `${selectedLoan.dailyPaymentPi.toFixed(8)} Pi` : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-2">Due tomorrow at 00:00 UTC</p>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loans List */}
        <Card className="border-gray-300 shadow-lg">
          <CardHeader>
            <CardTitle>Your Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.map((loan) => (
                <div
                  key={loan.loanId}
                  onClick={() => setSelectedLoan(loan)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedLoan?.loanId === loan.loanId
                      ? 'bg-green-100 border-green-500'
                      : 'bg-gray-50 border-gray-200 hover:border-green-400'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <div className="font-semibold">{loan.tractorName}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      loan.status === 'ACTIVE' ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-900'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Principal: {loan.principalPi.toFixed(4)} Pi</div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(loan.completedPayments / loan.loanTermDays) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {loan.completedPayments} / {loan.loanTermDays} payments completed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Loan Details */}
        {selectedLoan && (
          <Card className="border-green-300 shadow-lg">
            <CardHeader>
              <CardTitle>{selectedLoan.tractorName} - Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600">Daily Payment</p>
                  <p className="font-bold text-lg">{selectedLoan.dailyPaymentPi.toFixed(8)} Pi</p>
                  <p className="text-xs text-gray-500">${selectedLoan.dailyPaymentUSD.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Interest Rate</p>
                  <p className="font-bold text-lg">{(selectedLoan.annualRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Per annum</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Interest</p>
                  <p className="font-bold text-lg">{selectedLoan.totalInterestPi.toFixed(4)} Pi</p>
                  <p className="text-xs text-gray-500">${selectedLoan.totalInterestUSD.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Missed Payments</p>
                  <p className={`font-bold text-lg ${selectedLoan.missedPayments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedLoan.missedPayments}
                  </p>
                </div>
              </div>


              <div>
                <p className="text-sm font-semibold mb-2">Repayment Progress</p>
                <Progress value={(selectedLoan.completedPayments / selectedLoan.loanTermDays) * 100} />
                <p className="text-xs text-gray-600 mt-1">
                  {selectedLoan.remainingPayments} days remaining ({(selectedLoan.remainingPayments / 365).toFixed(1)} years)
                </p>
              </div>


              <div className="pt-2 border-t">
                <p className="text-sm font-semibold mb-2">Collateral</p>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600">FODUBU Locked</p>
                  <p className="font-bold text-lg">{selectedLoan.collateralFODUBU} FODUBU</p>
                  <p className="text-xs text-gray-500 mt-1">Status: {selectedLoan.collateralStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>


      {selectedLoan && (
        <Card className="mt-6 border-gray-300 shadow-lg">
          <CardHeader>
            <CardTitle>Repayment Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={repaymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid Amount" />
                <Line type="monotone" dataKey="remaining" stroke="#ef4444" strokeWidth={2} name="Remaining Balance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>loans
        </Card>
      )}
    </div>
  );
}




