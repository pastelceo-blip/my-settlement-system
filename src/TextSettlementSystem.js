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
  const [companyCustomers, setCompanyCustomers] = useState({}); // 업체별 고객 목록
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyPrice, setNewCompanyPrice] = useState(10000);
  const [newCompanyType, setNewCompanyType] = useState('wedding'); // 업체 타입 추가
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [editingCompany, setEditingCompany] = useState(null);

  // 업체 추가
  const addCompany = () => {
    if (!newCompanyName.trim()) {
      alert('업체명을 입력해주세요.');
      return;
    }
    
    if (companies.some(company => company.name === newCompanyName.trim())) {
      alert('이미 존재하는 업체명입니다.');
      return;
    }

    setCompanies(prev => [...prev, { 
      name: newCompanyName.trim(), 
      price: newCompanyPrice,
      type: newCompanyType
    }]);
    setNewCompanyName('');
    setNewCompanyPrice(10000);
  };

  // 업체 수정
  const updateCompany = (index, name, price, type) => {
    setCompanies(prev => prev.map((company, i) => 
      i === index ? { name: name.trim(), price: parseInt(price), type: type || 'wedding' } : company
    ));
    setEditingCompany(null);
  };

  // 업체 선택/해제
  const toggleCompany = (companyName) => {
    setSelectedCompanies(prev => {
      let newSelected;
      if (prev.includes(companyName)) {
        newSelected = prev.filter(name => name !== companyName);
        // 업체 제거 시 해당 업체의 고객 목록도 제거
        setCompanyCustomers(prevCustomers => {
          const { [companyName]: removed, ...rest } = prevCustomers;
          return rest;
        });
      } else {
        newSelected = [...prev, companyName];
        // 업체 추가 시 빈 고객 목록 초기화
        setCompanyCustomers(prevCustomers => ({
          ...prevCustomers,
          [companyName]: ''
        }));
      }
      return newSelected;
    });
  };

  // 업체 삭제
  const deleteCompany = (index) => {
    const companyName = companies[index]?.name;
    setCompanies(prev => prev.filter((_, i) => i !== index));
    setSelectedCompanies(prev => prev.filter(name => name !== companyName));
  };

  // 정산서 생성 (여러 업체용)
  const generateSettlements = () => {
    if (!selectedMonth) {
      alert('정산월을 선택해주세요.');
      return;
    }
    
    if (selectedCompanies.length === 0) {
      alert('업체를 선택해주세요.');
      return;
    }

    // 고객 데이터가 있는 업체만 필터링
    const companiesWithData = selectedCompanies.filter(companyName => {
      const customers = (companyCustomers[companyName] || '').split('\n').filter(line => line.trim());
      return customers.length > 0;
    });

    console.log('데이터가 있는 업체들:', companiesWithData);

    if (companiesWithData.length === 0) {
      alert('최소 한 업체에는 고객 정보를 입력해주세요.');
      return;
    }

    const newSettlements = selectedCompanies.map(companyName => {
      const company = companies.find(c => c.name === companyName);
      const totalCount = customers.length;
      const totalAmount = totalCount * company.price;
      const serviceTypeText = serviceType === 'wedding' ? '웨딩영상' : '돌잔치영상';
      
      const message = `안녕하세요😁
건별 정산내용 보내드립니다!
이번달은 ${totalCount}건의 ${serviceTypeText} 제작건이 있었습니다. 
최종 합계금액은 ${totalAmount.toLocaleString()}원이며 입금계좌는 아래와 같습니다.

상세내역:
${customers.map(customer => customer.trim()).join('\n')}

국민은행 이용현 781601-00-231766 으로
합계금액 ${totalAmount.toLocaleString()}원을 입금 요청드립니다.
오늘 하루도 행복만 가득하세요!`;

      return {
        id: Date.now() + Math.random(),
        companyName,
        month: selectedMonth,
        serviceType,
        customers,
        totalCount,
        totalAmount,
        unitPrice: company.price,
        message,
        createdAt: new Date().toLocaleString()
      };
    });

    setSettlements(prev => [...newSettlements, ...prev]);
    
    // 입력 초기화
    setCompanyCustomers({});
  };

  // 메시지 복사
  const copyMessage = (message, index) => {
    navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  // 정산서 삭제
  const deleteSettlement = (id) => {
    setSettlements(prev => prev.filter(settlement => settlement.id !== id));
  };

  // 전체 정산 내역 다운로드
  const downloadAllSettlements = () => {
    let content = `정산 내역 모음\n`;
    content += `생성일: ${new Date().toLocaleString()}\n`;
    content += `=`.repeat(60) + '\n\n';
    
    settlements.forEach((settlement, idx) => {
      content += `${idx + 1}. ${settlement.companyName} (${settlement.month})\n`;
      content += `서비스: ${settlement.serviceType === 'wedding' ? '웨딩영상' : '돌잔치영상'}\n`;
      content += `건수: ${settlement.totalCount}건 (${settlement.unitPrice.toLocaleString()}원/건)\n`;
      content += `금액: ${settlement.totalAmount.toLocaleString()}원\n`;
      content += `생성일: ${settlement.createdAt}\n\n`;
      content += `메시지 내용:\n`;
      content += `-`.repeat(40) + '\n';
      content += settlement.message + '\n';
      content += `=`.repeat(60) + '\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `정산내역_전체_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getServiceColor = (serviceType) => {
    return serviceType === 'wedding' ? 'from-pink-500 to-rose-600' : 'from-blue-500 to-indigo-600';
  };

  const getServiceBgColor = (serviceType) => {
    return serviceType === 'wedding' ? 'from-pink-50 to-rose-50' : 'from-blue-50 to-indigo-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            텍스트 기반 정산서 생성기
          </h1>
          <p className="text-gray-600 text-lg">
            정산월 선택 후 고객명을 입력하면 정산서를 자동으로 생성합니다
          </p>
        </div>

        {/* 1단계: 정산월 선택 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">1단계: 정산월 선택</h2>
              <p className="text-gray-600">먼저 정산할 월을 선택해주세요</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full max-w-xs px-4 py-3 border-2 border-blue-200 focus:border-blue-500 rounded-xl focus:outline-none transition-colors bg-white/50 backdrop-blur-sm text-lg font-medium"
            />
            {selectedMonth && (
              <div className="mt-3 flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="font-medium">{selectedMonth} 선택됨</span>
              </div>
            )}
          </div>
        </div>

        {selectedMonth && (
          <>
            {/* 2단계: 업체 관리 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">2단계: 업체 선택 및 관리</h2>
                  <p className="text-gray-600">정산할 업체를 선택하거나 새 업체를 추가하세요</p>
                </div>
              </div>

              {/* 업체 추가 폼 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">새 업체 추가</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="업체명"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="number"
                    value={newCompanyPrice}
                    onChange={(e) => setNewCompanyPrice(parseInt(e.target.value) || 0)}
                    placeholder="단가"
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                  <select
                    value={newCompanyType}
                    onChange={(e) => setNewCompanyType(e.target.value)}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  >
                    <option value="wedding">웨딩</option>
                    <option value="doljabi">돌잔치</option>
                  </select>
                  <button
                    onClick={addCompany}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>
              </div>

              {/* 업체 목록 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {companies.map((company, index) => {
                  const isSelected = selectedCompanies.includes(company.name);
                  const borderColor = company.type === 'wedding' 
                    ? (isSelected ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 bg-white hover:border-purple-300')
                    : (isSelected ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200 bg-white hover:border-orange-300');
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform ${borderColor} ${isSelected ? 'scale-105' : 'hover:bg-gray-50'}`}
                      onClick={() => editingCompany !== index && toggleCompany(company.name)}
                    >
                      {editingCompany === index ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={company.name}
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                          <input
                            type="number"
                            defaultValue={company.price}
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                          <select
                            defaultValue={company.type}
                            className="w-full px-2 py-1 text-sm border rounded"
                          >
                            <option value="wedding">웨딩</option>
                            <option value="doljabi">돌잔치</option>
                          </select>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const container = e.target.closest('.space-y-2');
                                const inputs = container.querySelectorAll('input');
                                const select = container.querySelector('select');
                                updateCompany(index, inputs[0].value, inputs[1].value, select.value);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded text-xs"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCompany(null);
                              }}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCompany(company.name)}
                              className={`w-4 h-4 mr-3 ${company.type === 'wedding' ? 'text-purple-600' : 'text-orange-600'}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-800">{company.name}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    company.type === 'wedding' 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {company.type === 'wedding' ? '웨딩' : '돌잔치'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{company.price.toLocaleString()}원/건</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-1 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCompany(index);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCompany(index);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 선택된 업체 표시 */}
              {selectedCompanies.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">선택된 업체 ({selectedCompanies.length}개)</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompanies.map(companyName => {
                      const company = companies.find(c => c.name === companyName);
                      const bgColor = company?.type === 'wedding' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
                      const buttonColor = company?.type === 'wedding' ? 'text-purple-600 hover:text-purple-800' : 'text-orange-600 hover:text-orange-800';
                      
                      return (
                        <div key={companyName} className={`flex items-center gap-2 ${bgColor} px-3 py-1 rounded-lg text-sm`}>
                          <span>{companyName} ({company?.price.toLocaleString()}원)</span>
                          <button
                            onClick={() => toggleCompany(companyName)}
                            className={buttonColor}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3단계: 정산서 작성 */}
            {selectedCompanies.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">3단계: 정산서 작성</h2>
                    <p className="text-gray-600">{selectedCompanies.join(', ')} - {selectedMonth} 정산 내역을 작성하세요</p>
                  </div>
                </div>

                {/* 업체별 고객 입력 폼 */}
                <div className="space-y-6 mb-8">
                  {selectedCompanies.map(companyName => {
                    const company = companies.find(c => c.name === companyName);
                    const borderColor = company?.type === 'wedding' ? 'border-purple-200' : 'border-orange-200';
                    const bgColor = company?.type === 'wedding' ? 'from-purple-50 to-pink-50' : 'from-orange-50 to-yellow-50';
                    const focusColor = company?.type === 'wedding' ? 'focus:border-purple-500' : 'focus:border-orange-500';
                    const customerCount = (companyCustomers[companyName] || '').split('\n').filter(line => line.trim()).length;
                    
                    return (
                      <div key={companyName} className={`bg-gradient-to-r ${bgColor} rounded-2xl p-6 border-2 ${borderColor}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-800">{companyName}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              company?.type === 'wedding' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {company?.type === 'wedding' ? '웨딩영상' : '돌잔치영상'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {company?.price.toLocaleString()}원/건
                            </span>
                          </div>
                          <div className={`px-4 py-2 ${company?.type === 'wedding' ? 'bg-purple-600' : 'bg-orange-600'} text-white rounded-xl font-bold`}>
                            {customerCount}건 / {(customerCount * (company?.price || 0)).toLocaleString()}원
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            고객 목록 (한 줄에 한 명씩 입력)
                          </label>
                          <textarea
                            value={companyCustomers[companyName] || ''}
                            onChange={(e) => setCompanyCustomers(prev => ({
                              ...prev,
                              [companyName]: e.target.value
                            }))}
                            placeholder="홍길동 & 김영희&#10;이순신 & 유관순&#10;아기이름(엄마이름)&#10;&#10;여러 줄로 입력하면&#10;자동으로 분리됩니다"
                            rows={8}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none ${focusColor} resize-none bg-white/70`}
                          />
                          <div className="text-sm text-gray-500 mt-2">
                            현재 {customerCount}건 입력됨
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 전체 미리보기 */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">전체 미리보기</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">정산월:</span>
                      <span className="font-medium">{selectedMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 업체 수:</span>
                      <span className="font-medium">{selectedCompanies.length}개</span>
                    </div>
                    
                    {/* 업체별 요약 */}
                    <div className="border-t pt-3">
                      <div className="text-sm text-gray-600 mb-2">업체별 정산 금액:</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedCompanies.map(companyName => {
                          const company = companies.find(c => c.name === companyName);
                          const customerCount = (companyCustomers[companyName] || '').split('\n').filter(line => line.trim()).length;
                          const amount = customerCount * (company?.price || 0);
                          return (
                            <div key={companyName} className="flex justify-between text-sm">
                              <span>{companyName} ({customerCount}건):</span>
                              <span className={`font-medium ${company?.type === 'wedding' ? 'text-purple-600' : 'text-orange-600'}`}>
                                {amount.toLocaleString()}원
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                        <span>총 생성될 정산서:</span>
                        <span className="text-purple-600">{selectedCompanies.length}개</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 생성 버튼 */}
                <button
                  onClick={generateSettlements}
                  disabled={selectedCompanies.every(companyName => 
                    !(companyCustomers[companyName] || '').trim()
                  )}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100"
                >
                  <Calculator className="w-5 h-5" />
                  {selectedCompanies.length}개 정산서 생성하기
                </button>
              </div>
            )}
          </>
        )}

        {/* 생성된 정산서 목록 */}
        {settlements.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">생성된 정산서</h2>
                  <p className="text-gray-600">총 {settlements.length}개의 정산서가 생성되었습니다</p>
                </div>
              </div>
              
              {settlements.length > 0 && (
                <button
                  onClick={downloadAllSettlements}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  전체 다운로드
                </button>
              )}
            </div>

            <div className="space-y-6">
              {settlements.map((settlement, index) => (
                <div key={settlement.id} className={`bg-gradient-to-r ${getServiceBgColor(settlement.serviceType)} rounded-2xl p-6 border border-gray-200 shadow-lg`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{settlement.companyName}</h3>
                        <span className={`px-3 py-1 bg-gradient-to-r ${getServiceColor(settlement.serviceType)} text-white text-sm font-medium rounded-full`}>
                          {settlement.serviceType === 'wedding' ? '웨딩' : '돌잔치'}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{settlement.month}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{settlement.totalCount}건</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            <span>{settlement.totalAmount.toLocaleString()}원 ({settlement.unitPrice.toLocaleString()}원/건)</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          생성일: {settlement.createdAt}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyMessage(settlement.message, index)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                          copiedIndex === index
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            복사
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteSettlement(settlement.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 font-mono text-sm whitespace-pre-line text-gray-700 border border-white/30">
                    {settlement.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        {!selectedMonth && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">정산월을 먼저 선택하세요</h3>
            <p className="text-gray-600 mb-8">정산월을 선택하면 업체 선택과 고객 입력이 가능합니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextSettlementSystem;