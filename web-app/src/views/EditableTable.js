import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { Table, Input, Button, Popconfirm, Form } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { encrypted_db } from "../config";
import { default as ReactSelect } from "react-select";
import * as ApiService from "../api/ApiService";
import * as ReactSelectHelper from "./Studio/ReactSelectHelper";
import { toast } from "react-toastify";

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: "name",
        dataIndex: "name",
        width: "20%",
        editable: true,
      },
      {
        title: "type",
        dataIndex: "type",
        editable: true,
      },
      {
        title: "length",
        dataIndex: "length",
        editable: true,
      },
      {
        title: "encryption",
        dataIndex: "encryption",
        editable: true,
      },
      {
        title: "fuzzy",
        dataIndex: "fuzzy",
        editable: true,
      },
      {
        title: "token",
        dataIndex: "token",
        editable: true,
      },
      {
        title: "operation",
        dataIndex: "operation",
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record.key)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];
    this.state = {
      dataSource: [
        {
          key: "0",
          name: "id",
          type: "INT",
          length: "10",
          encryption: "True",
          fuzzy: "True",
          token: "abcdefghijkl@xyzgh#$%^&*()",
        },
        {
          key: "1",
          name: "name",
          type: "VARCHAR",
          length: "10",
          encryption: "False",
          fuzzy: "False",
          token: "pqrstuvwxyz@#$abcdefg%^&*()",
        },
      ],
      count: 2,
      table_name: "",
      selectedJdbcDataSource: null,
      jdbcDataSourcesForSelect: [],
    };
  }

  async componentDidMount() {
    const { data: jdbcDataSources = [] } =
      await ApiService.fetchJdbcdatasources();
    const jdbcDataSourcesForSelect = jdbcDataSources.map((val) => {
      return {
        label: val.name,
        value: val.id,
      };
    });

    this.setState({
      jdbcDataSourcesForSelect,
    });
  }

  save = () => {
    const { dataSource, table_name, count, selectedJdbcDataSource } =
      this.state;

    let ds = {
      dataSource: dataSource,
      table_name: table_name,
      count: count,
      selectedJdbcDataSource: selectedJdbcDataSource,
    };
    axios
      .post(encrypted_db + "/create_table", ds)
      .then((res) => {
        toast.success("Success");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleInputChange = (table_name, value, isNumber = false) => {
    let v = isNumber ? parseInt(value, 10) || 0 : value;
    this.setState({
      [table_name]: v,
    });
  };

  handleJdbcDataSourceChange = (selectedOption) => {
    this.setState({
      selectedJdbcDataSource: selectedOption,
    });
  };

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };
  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `name${count}`,
      type: "VARCHAR",
      length: "10",
      encryption: "False",
      fuzzy: "False",
      token: `abcded@#$p%^&xyz*()${count}`,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };
  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  };

  render() {
    const { dataSource, jdbcDataSourcesForSelect = [] } = this.state;

    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div className="full-page-content">
        <div className="display-flex" style={{margin: '0 0 10px 0'}}>
          <div className="table-lable display-flex" style={{flex: '1'}}>
            <label style={{margin: '0 15px 0 0',whiteSpace: 'nowrap'}}>
              Data Source <span className="required">*</span>
            </label>
            <div  style={{width: '100%'}}>
              <ReactSelect
                placeholder={"Select Data Source..."}
                value={this.state.selectedJdbcDataSource}
                onChange={this.handleJdbcDataSourceChange}
                options={jdbcDataSourcesForSelect}
                styles={ReactSelectHelper.CUSTOM_STYLE}
            />
            </div>
          </div>
          <div className="table-property-panel" style={{flex: '1'}}>
            <div className="form-panel" style={{display: 'flex',alignItems: 'center',height: '33px'}}>
              <label style={{width: 'auto',whiteSpace: 'nowrap', margin: '0 20px'}}>Table Name</label>
              <input
                className="form-input"
                type="text"
                name="table_name"
                style={{height: '33px', margin: '0px'}}
                value={this.state.table_name}
                onChange={(event) =>
                  this.handleInputChange("table_name", event.target.value)
                }
              />
            </div>
          </div>
          <div class="row" style={{flex: '1',display: 'flex',justifyContent:'flex-end',}}>
            <button
              className="button float-left"
              style={{ margin: "0 10px",padding: "0 15px" }}
              onClick={this.handleAdd}
            >
              <FontAwesomeIcon icon="plus" /> Add a column
            </button>
            <button
              className="button button-blue"
              style={{ padding: '0 20px' }}
              onClick={this.save}
            >
              {" "}
              Save
            </button>
          </div>
        </div>
        {/* <Button
          onClick={this.handleAdd}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Add a row
        </Button> */}
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    );
  }
}

export default EditableTable;