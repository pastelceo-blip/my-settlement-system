import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Download, Copy, Check, CreditCard, Users, Calendar, Edit2, Save, X } from 'lucide-react';

const TextSettlementSystem = () => {
  const [settlements, setSettlements] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [companies, setCompanies] = useState([
    { name: '연웨딩', price: 10000, type: 'wedding' },
    { name: '유엔웨딩', price: 10000, type: 'wedding' },
    { name: '지플랜', price: 10000, type: 'wedding' },
    { name: '홍스웨딩', price: 10000, type: 'wedding' },
    { name: '웨딩세렌', price: 19800, type: 'wedding' },
    { name: '휘즈플랜', price: 10000, type: 'wedding' },
    { name: '서정웨딩', price: 19800, type: 'wedding' }
  ]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [companyCustomers, setCompanyCustomers] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const generateSettlements = () => {
    const companiesWithData = selectedCompanies.filter(companyName => {
      const customerList = (companyCustomers[companyName] || '').split('\n').filter(line => line.trim());
      return customerList.length > 0;
    });

    if (companiesWithData.length === 0) {
      alert('최소 한 업체에는 고객 정보를 입력해주세요.');
      return;
    }

    const newSettlements = companiesWithData.map(companyName => {
      const company = companies.find(c => c.name === companyName);
      const customerList = (companyCustomers[companyName] || '').split('\n').filter(line => line.trim());
      const totalCount = customerList.length;
      const totalAmount = totalCount * company.price;
      const serviceTypeText = company.type === 'wedding' ? '웨딩영상' : '돌잔치영상';
      
      const message = `안녕하세요😁
건별 정산내용 보내드립니다!
이번달은 ${totalCount}건의 ${serviceTypeText} 제작건이 있었습니다. 
최종 합계금액은 ${totalAmount.toLocaleString()}원이며 입금계좌는 아래와 같습니다.

상세내역:
${customerList.map(customer => customer.trim()).join('\n')}

국민은행 이용현 781601-00-231766 으로
합계금액 ${totalAmount.toLocaleString()}원을 입금 요청드립니다.
오늘 하루도 행복만 가득하세요!`;

      return {
        id: Date.now() + Math.random(),
        companyName,
        month: selectedMonth,
        serviceType: company.type,
        customers: customerList,
        totalCount,
        totalAmount,
        unitPrice: company.price,
        message,
        createdAt: new Date().toLocaleString()
      };
    });

    setSettlements(prev => [...newSettlements, ...prev]);
    setCompanyCustomers({});
  };

  const toggleCompany = (companyName) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyName)) {
        const newSelected = prev.filter(name => name !== companyName);
        setCompanyCustomers(prevCustomers => {
          const { [companyName]: removed, ...rest } = prevCustomers;
          return rest;
        });
        return newSelected;
      } else {
        setCompanyCustomers(prevCustomers => ({
          ...prevCustomers,
          [companyName]: ''
        }));
        return [...prev, companyName];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            텍스트 기반 정산서 생성기
          </h1>
        </div>

        {/* 1단계: 정산월 선택 */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1단계: 정산월 선택</h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-3 border rounded-xl"
          />
        </div>

        {/* 2단계: 업체 선택 */}
        {selectedMonth && (
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2단계: 업체 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company, index) => {
                const isSelected = selectedCompanies.includes(company.name);
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border-2 cursor-pointer ${
                      isSelected ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => toggleCompany(company.name)}
                  >
                    <h3 className="font-bold">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.price.toLocaleString()}원/건</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3단계: 고객 입력 */}
        {selectedCompanies.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3단계: 고객 목록 입력</h2>
            {selectedCompanies.map(companyName => (
              <div key={companyName} className="mb-6 p-4 border rounded-xl">
                <h3 className="font-bold mb-2">{companyName}</h3>
                <textarea
                  value={companyCustomers[companyName] || ''}
                  onChange={(e) => setCompanyCustomers(prev => ({
                    ...prev,
                    [companyName]: e.target.value
                  }))}
                  placeholder="고객명을 한 줄씩 입력하세요"
                  rows={6}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
            ))}
            
            <button
              onClick={generateSettlements}
              className="w-full px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700"
            >
              정산서 생성하기
            </button>
          </div>
        )}

        {/* 생성된 정산서 */}
        {settlements.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">생성된 정산서</h2>
            {settlements.map((settlement, index) => (
              <div key={settlement.id} className="mb-6 p-6 border rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{settlement.companyName}</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(settlement.message);
                      setCopiedIndex(index);
                      setTimeout(() => setCopiedIndex(-1), 2000);
                    }}
                    className={`px-4 py-2 rounded-xl ${
                      copiedIndex === index ? 'bg-green-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {copiedIndex === index ? '복사됨' : '복사'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 whitespace-pre-line text-sm">
                  {settlement.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextSettlementSystem;