import React, { useState } from 'react';

const TextSettlementSystem = () => {
  const [settlements, setSettlements] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [companies] = useState([
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            텍스트 기반 정산서 생성기
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            정산월 선택 후 고객명을 입력하면 정산서를 자동으로 생성합니다
          </p>
        </div>

        {/* 1단계: 정산월 선택 */}
        <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            1단계: 정산월 선택
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>먼저 정산할 월을 선택해주세요</p>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ 
              padding: '0.75rem 1rem', 
              border: '2px solid #e5e7eb', 
              borderRadius: '0.75rem', 
              fontSize: '1.125rem',
              outline: 'none'
            }}
          />
        </div>

        {/* 2단계: 업체 선택 */}
        {selectedMonth && (
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              2단계: 업체 선택
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {companies.map((company, index) => {
                const isSelected = selectedCompanies.includes(company.name);
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleCompany(company.name)}
                    style={{ 
                      padding: '1rem', 
                      border: `2px solid ${isSelected ? '#8b5cf6' : '#e5e7eb'}`, 
                      borderRadius: '0.75rem',
                      backgroundColor: isSelected ? '#f3e8ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <h3 style={{ fontWeight: 'bold', color: '#1f2937' }}>{company.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {company.price.toLocaleString()}원/건
                    </p>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: company.type === 'wedding' ? '#ddd6fe' : '#fed7aa',
                      color: company.type === 'wedding' ? '#7c3aed' : '#ea580c',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      marginTop: '0.5rem'
                    }}>
                      {company.type === 'wedding' ? '웨딩' : '돌잔치'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3단계: 고객 입력 */}
        {selectedCompanies.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              3단계: 고객 목록 입력
            </h2>
            {selectedCompanies.map(companyName => {
              const company = companies.find(c => c.name === companyName);
              const customerCount = (companyCustomers[companyName] || '').split('\n').filter(line => line.trim()).length;
              
              return (
                <div key={companyName} style={{ marginBottom: '1.5rem', padding: '1rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 'bold', color: '#1f2937' }}>{companyName}</h3>
                    <div style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#8b5cf6', 
                      color: 'white', 
                      borderRadius: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {customerCount}건 / {(customerCount * company.price).toLocaleString()}원
                    </div>
                  </div>
                  <textarea
                    value={companyCustomers[companyName] || ''}
                    onChange={(e) => setCompanyCustomers(prev => ({
                      ...prev,
                      [companyName]: e.target.value
                    }))}
                    placeholder="고객명을 한 줄씩 입력하세요&#10;홍길동 & 김영희&#10;이순신 & 유관순"
                    rows={6}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.5rem',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    현재 {customerCount}건 입력됨
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={generateSettlements}
              style={{ 
                width: '100%', 
                padding: '1rem 2rem', 
                backgroundColor: '#8b5cf6', 
                color: 'white', 
                fontSize: '1.125rem',
                fontWeight: 'bold', 
                borderRadius: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
            >
              정산서 생성하기
            </button>
          </div>
        )}

        {/* 생성된 정산서 */}
        {settlements.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              생성된 정산서
            </h2>
            {settlements.map((settlement, index) => (
              <div key={settlement.id} style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                    {settlement.companyName}
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(settlement.message);
                      alert('메시지가 복사되었습니다!');
                    }}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    복사
                  </button>
                </div>
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-line',
                  color: '#374151'
                }}>
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