import { Pagination, Select } from 'antd';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';

function RenderPages({
  page = 1,
  limit = 10,
  tototlItems,
  totalCount = 0,
  limitOptions = [
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 50, label: 50 },
    { value: 100, label: 100 },
    { value: 500, label: 500 },
    { value: 1000, label: 1000 },
  ],
  onChange = () => {},
  isSortTable = false,
  handleCustomClick = () => {},
}) {
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const handleSelectChange = (value) => {
    setPageSize(value);
    onChange(page, value);
  };

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    onChange(page, pageSize);
  };

  return (
    <div className="sm:h-[50px] px-3 py-1.5 rounded-b-3 bg-[#0F172A] w-full flex flex-row flex-wrap justify-between items-center gap-2 text-base text-white border-t border-[#1E2633]">
      <div className="w-auto flex items-center h-8 text-[#94A3B8] font-semibold text-sm">
        Hiển thị {tototlItems} trên tổng {numeral(totalCount).format('0,0')}
      </div>
      <div className="w-full sm:w-auto flex justify-end gap-3 items-center list-none">
        {isSortTable && (
          <div
            role="button"
            onClick={() => handleCustomClick()}
            className="text-white px-3 py-2 bg-primary500 rounded-2 flex items-center gap-1 cursor-pointer h-9"
            aria-label="Tùy chỉnh">
            <SettingOutlined /> Tùy chỉnh
          </div>
        )}
        <div className="custom-pagination-wrapper flex items-center gap-3">
          <Select
            value={limit}
            options={limitOptions}
            onChange={handleSelectChange}
            allowClear={false}
            className="w-20"
          />

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onChange={handlePaginationChange}
            itemRender={(page, type, originalElement) => {
              if (type === 'prev' || type === 'next') {
                return null;
              }
              return originalElement;
            }}
            showSizeChanger={false}
            className="custom-pagination"
          />
        </div>
      </div>
    </div>
  );
}

export default RenderPages;
