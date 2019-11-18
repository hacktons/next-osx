import React, { PureComponent } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default class StackAreaChart extends PureComponent {

    render() {
        const data = this.props.data;
        const keys = this.props.keys;
        return (
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10, right: 30, left: 0, bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis/>
                    {/* <YAxis label={{ value: '时间/ms', angle: -90, position: 'insideLeft', textAnchor: 'middle' }} /> */}
                    {/* <Tooltip formatter={(value, name, props) => ([value, this.mapping(name)])} /> */}
                    <Tooltip/>
                    <Area name={keys[0].name} type="monotone" dataKey={keys[0].key} stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area name={keys[1].name} type="monotone" dataKey={keys[1].key} stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area name={keys[2].name} type="monotone" dataKey={keys[2].key} stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
            </ResponsiveContainer>

        );
    }
    mapping = name => {
        const keys = this.props.keys;
        if (keys === undefined) {
            return name;
        }
        const result = this.props.keys.filter(it => (it.key === name));
        if (result === undefined) {
            return name;
        }
        return result[0].name
    }
}
