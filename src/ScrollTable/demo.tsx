import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import ScrollTable from '.';
import { todoList1 } from './mock/data';

const dataList = todoList1.splice(0, 20);
const PAGE_SIZE = 5;

let rootDataSource: any[] = [];
let tableScrollHeight = 0;

const COLUMNS = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    // width: '15%',
    // align: 'center',
  },
  {
    title: '事项名',
    dataIndex: 'title',
    key: 'title',
    // width: '15%',
    // align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'completed',
    key: 'completed',
    renderText: (text: boolean) => (text ? '已完成' : '未完成'),
    // valueEnum: {
    //   true: { text: '已完成' },
    //   false: { text: '未完成' },
    // },
    // width: '15%',
    // align: 'center',
  },
];

const ScrollTableDemo = () => {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<any>([]);

  const getFileList = async (page?: number) => {
    setLoading(true);
    if (!page || page == 1) {
      // rootDataSource = [];
      setDataSource([]);
      setTotal(0);
    }
    try {
      /**
       * 此处可发起一些网络请求
       * 如下为网络数据处理逻辑
       */
      // let query = { };
      // const res: any = await listApi(query);
      // setLoading(false);
      // if (response.success) {
      //   setTotal(response.data.total);
      //   rootDataSource = [
      //     ...rootDataSource,
      //     ...response.data.dataList.map((item) => {
      //       return { ...item, children: [] };
      //     }),
      //   ];
      //   setDataSource(rootDataSource);
      //   setExpandedRowKeys([]);

      /**以下为静态数据处理逻辑 */
      console.log(page, 'page');
      let newList: any[] = [];
      if (!page || page == 1) {
        newList = dataList.slice(0, PAGE_SIZE);
      } else {
        newList = dataList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      }
      rootDataSource = [...rootDataSource, ...newList];
      setTotal(dataList.length);
      setDataSource(rootDataSource);
    } catch (e: any) {
      setLoading(false);
      message.error(e.errorMessage);
    }
  };

  useEffect(() => {
    getFileList();

    tableScrollHeight = (document.getElementById('tableDemo')?.clientHeight ?? 0) - 55;
  }, []);

  return (
    <div id="tableDemo" style={{ height: '300px' }}>
      <ScrollTable
        getDataList={getFileList}
        totalNum={total}
        dataSource={dataSource}
        columns={COLUMNS}
        rowKey="id"
        scroll={{
          y: tableScrollHeight,
        }}
      />
    </div>
  );
};

export default ScrollTableDemo;
