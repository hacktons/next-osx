import React, { PureComponent } from 'react';
import {
    BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

export default class MixBarChart extends PureComponent {

    render() {
        const data = this.props.data;
        const keys = this.props.keys;
        return (
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: '时间/ms', angle: -90, position: 'insideLeft', textAnchor: 'middle' }} />
                    {/* <Tooltip formatter={(value, name, props) => ([value, this.mapping(name)])} /> */}
                    <Tooltip />
                    <Legend />
                    <Bar name={keys[2].name} dataKey={keys[2].key} stackId="a" fill="#8884d8" />
                    <Bar name={keys[1].name} dataKey={keys[1].key} stackId="a" fill="#82ca9d" />
                    <Bar name={keys[0].name} dataKey={keys[0].key} fill="#ffc658" />
                </BarChart>
            </ResponsiveContainer>

        );
    }

    mapping = name => {
        const keys = this.props.keys;
        if (keys === undefined) {
            return name;
        }
        const result = this.props.keys.filter(it => (it.key === name));
        if (result === undefined || result[0] === undefined) {
            return name;
        }
        return result[0].name
    }
}
