
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';


interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
  selectedCompany?: any;
}

export function CompanySearch({ onCompanySelect, selectedCompany }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch('/company-list')
      .then(res => res.json())
      .then(data => setCompanyList(data.companies || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = companyList.filter(company =>
    company.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (company: any) => {
    onCompanySelect({
      name: company.company,
      symbol: company.company, // fallback, since CSV has no symbol
      sector: company.industry || '',
      // ...other fields can be added if needed
    });
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={loading ? "Loading companies..." : "Search companies..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          className="pl-9"
          onFocus={() => setIsOpen(searchTerm.length > 0)}
          disabled={loading}
        />
      </div>

      {isOpen && filteredCompanies.length > 0 && (
        <Card className="absolute top-full mt-1 w-full z-50 max-h-60 overflow-y-auto shadow-card">
          <div className="p-2">
            {filteredCompanies.map((company, idx) => (
              <Button
                key={company.company + idx}
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleSelect(company)}
              >
                <div className="flex flex-col items-start">
                  <div className="font-medium">{company.company}</div>
                  <div className="text-sm text-muted-foreground">
                    {company.industry} • {company.region}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {selectedCompany && (
        <div className="mt-2 text-sm text-muted-foreground">
          Selected: {selectedCompany.name}
        </div>
      )}
    </div>
  );
}