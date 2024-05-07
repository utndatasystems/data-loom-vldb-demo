import React from 'react';
import CodeMirror, { lineNumbers } from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import * as Backend from '../backend.js';

export default class TpchSchemaScreen extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         query: `drop table if exists region;
create table region
(
   r_regionkey integer not null,
   r_name      text    not null,
   r_comment   text    not null
);

drop table if exists nation;
create table nation
(
   n_nationkey integer not null,
   n_name      text    not null,
   n_regionkey integer not null,
   n_comment   text    not null
);

drop table if exists customer;
create table customer
(
   c_custkey    integer        not null,
   c_name       text           not null,
   c_address    text           not null,
   c_nationkey  integer        not null,
   c_phone      text           not null,
   c_acctbal    decimal(12, 2) not null,
   c_mktsegment text           not null,
   c_comment    text           not null
);

drop table if exists orders;
create table orders
(
   o_orderkey      integer        not null,
   o_custkey       integer        not null,
   o_orderstatus   text           not null,
   o_totalprice    decimal(12, 2) not null,
   o_orderdate     date           not null,
   o_orderpriority text           not null,
   o_clerk         text           not null,
   o_shippriority  integer        not null,
   o_comment       text           not null
);

drop table if exists lineitem;
create table lineitem
(
   l_orderkey      integer        not null,
   l_partkey       integer        not null,
   l_suppkey       integer        not null,
   l_linenumber    integer        not null,
   l_quantity      decimal(12, 2) not null,
   l_extendedprice decimal(12, 2) not null,
   l_discount      decimal(12, 2) not null,
   l_tax           decimal(12, 2) not null,
   l_returnflag    text           not null,
   l_linestatus    text           not null,
   l_shipdate      date           not null,
   l_commitdate    date           not null,
   l_receiptdate   date           not null,
   l_shipinstruct  text           not null,
   l_shipmode      text           not null,
   l_comment       text           not null
);

drop table if exists supplier;
create table supplier
(
   s_suppkey   integer        not null,
   s_name      text           not null,
   s_address   text           not null,
   s_nationkey integer        not null,
   s_phone     text           not null,
   s_acctbal   decimal(12, 2) not null,
   s_comment   text           not null
);

drop table if exists partsupp;
create table partsupp
(
   ps_partkey    integer        not null,
   ps_suppkey    integer        not null,
   ps_availqty   integer        not null,
   ps_supplycost decimal(12, 2) not null,
   ps_comment    text           not null
);

drop table if exists part;
create table part
(
   p_partkey     integer        not null,
   p_name        text           not null,
   p_mfgr        text           not null,
   p_brand       text           not null,
   p_type        text           not null,
   p_size        integer        not null,
   p_container   text           not null,
   p_retailprice decimal(12, 2) not null,
   p_comment     text           not null
);
         `,
      }
   }

   render() {
      return (
         <div className="small-12 cell">
            {this.renderEditor()}
         </div >
      );
   }

   renderEditor() {
      return (
         <div className="grid-x grid-padding-x grid-padding-y">
            <div className="small-12 cell">
               <h4>TPC-H Schema</h4>
               <CodeMirror
                  value={this.state.query}
                  height="800px"
                  dialect="postgres"
                  basicSetup={{
                     foldGutter: false,
                     searchKeymap: false,
                  }}
                  extensions={[sql({})]}
                  onChange={(e) => { }}
                  style={{ border: "1px solid #aaaaaa" }}
               />
            </div>
         </div>
      );
   }
}
