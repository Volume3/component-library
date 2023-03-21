import './index.less';

import {
  GetPopupContainer,
  GetRowKey,
  Key,
  SorterResult,
  TableCurrentDataSource,
  TablePaginationConfig,
  TableRowSelection,
} from 'antd/lib/table/interface';
import React, { useEffect, useState } from 'react';

import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { TableProps as RcTableProps } from 'rc-table/lib/Table';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { SpinProps } from 'antd/lib/spin';

interface ScrollTableProps {
  className?: string | undefined;
  dataSource?: RcTableProps<any>['data'];
  showSorterTooltip?: boolean | undefined;
  columns?: any[];
  tableAlertRender?: ({ selectedRowKeys, selectedRows, onCleanSelected }) => React.ReactNode;
  tableAlertOptionRender?: () => React.ReactNode;
  loading?: boolean | SpinProps;
  bordered?: boolean;
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, Key[] | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
    extra: TableCurrentDataSource<any>,
  ) => void;
  rowSelection?: TableRowSelection<any>;
  scroll?: RcTableProps<any>['scroll'] & {
    scrollToFirstRowOnChange?: boolean;
  };
  size?: SizeType;
  onRow?: any;
  getPopupContainer?: GetPopupContainer;
  rowKey?: string | GetRowKey<any> | undefined;
  pageSize?: number; // 一页数量
  mountId?: string; // 用于计算表格滚动高度
  getDataList: (page?: number) => void; // 获取表格列表数据
  totalNum: number; // 表格数据总数
  monitorName?: string; // 监听滚动条元素类名(切换tabs时, 组件不销毁仅是看不见, 监听ant-table-body会把监听滚动条事件挂到第一个tabs下的表格, 哪怕此时页面上看不到这个表格, 因此用类名来区分不同tab)
  page?: number; // 用于判断父级组件是否切换表格, 以清空currentPage
  monitorElement?: Element | null;
  expandedRowKeys?: any[];
  onExpand?: (expanded, record) => void;
}

const ScrollTable = (props: ScrollTableProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { page, dataSource, totalNum, monitorName, getDataList, monitorElement } = props;

  /**
   * 获取监听表格的元素
   * @param name 监听元素的类名
   */
  const getMonitorElement = (name: string | undefined) => {
    if (name !== undefined) {
      return document.getElementsByClassName(name)[0]?.querySelector('.ant-table-body');
    } else {
      return document.querySelector('.ant-table-body');
    }
  };

  /**
   * 返回组装的提示节点
   * @param text 提示文字
   * @returns HTMLParagraphElement
   */
  const getInfoElement = (text: string) => {
    let scrollInfo = document.createElement('p');
    scrollInfo.className = 'scrollInfo';
    scrollInfo.textContent = text;
    return scrollInfo;
  };

  const handleScroll = (event: any) => {
    let maxScroll = event.target.scrollHeight - event.target.clientHeight;
    let currentScroll = event.target.scrollTop;

    if (currentScroll !== 0 && currentScroll > maxScroll - 20 && totalNum !== 0) {
      let tableContent = monitorElement ?? getMonitorElement(monitorName);
      let lastChild = tableContent?.lastChild;

      if (totalNum > (dataSource ?? []).length) {
        // 还没加载全部数据
        setCurrentPage(currentPage + 1);
        if (lastChild?.nodeName === 'TABLE') {
          let scrollInfo = getInfoElement('加载中...');
          tableContent?.appendChild(scrollInfo);
        } else if (
          lastChild?.nodeName === 'P' &&
          lastChild?.firstChild?.textContent === '没有更多数据了'
        ) {
          lastChild.firstChild.textContent = '加载中...';
        }
      } else {
        // 全部数据已加载完
        let tableContent = monitorElement ?? getMonitorElement(monitorName);
        if (tableContent?.lastChild?.nodeName === 'TABLE') {
          let scrollInfo = getInfoElement('没有更多数据了');
          tableContent?.appendChild(scrollInfo);
        } else if (
          lastChild?.nodeName === 'P' &&
          lastChild?.firstChild?.textContent === '加载中...'
        ) {
          lastChild.firstChild.textContent = '没有更多数据了';
        }
      }
    }
  };

  useEffect(() => {
    let tableContent = monitorElement ?? getMonitorElement(monitorName);
    tableContent?.addEventListener('scroll', handleScroll);

    return () => {
      tableContent?.removeEventListener('scroll', handleScroll);
      if (tableContent?.lastChild?.nodeName === 'P') {
        tableContent.removeChild(tableContent?.lastChild);
      }
    };
  }, [totalNum, dataSource]);

  useEffect(() => {
    if (currentPage !== 1) {
      getDataList(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (page === 1) {
      // 父组件调用getDataList并且返回第一页的数据
      setCurrentPage(1);
    }
  }, [page]);

  return (
    <ProTable
      indentSize={5}
      loading={props.loading}
      toolBarRender={false}
      search={false}
      columns={props.columns}
      dataSource={dataSource}
      rowKey={props.rowKey}
      pagination={false}
      onRow={props.onRow}
      size={props.size}
      tableAlertRender={props.tableAlertRender}
      tableAlertOptionRender={props.tableAlertOptionRender}
      className={props.className}
      bordered={props.bordered}
      getPopupContainer={props.getPopupContainer}
      showSorterTooltip={props.showSorterTooltip}
      rowSelection={props.rowSelection}
      onChange={props.onChange as any}
      expandedRowKeys={props.expandedRowKeys}
      onExpand={props.onExpand}
      scroll={
        totalNum === 0
          ? undefined
          : props.scroll ?? {
              y: (document.getElementById(props.mountId as string)?.clientHeight ?? 0) - 55,
            }
      }
    />
  );
};

export default ScrollTable;
